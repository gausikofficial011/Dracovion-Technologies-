import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { OTP, OTPPurpose } from '../models/OTP';
import { sendOTPEmail } from './emailService';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

const OTP_EXPIRES_MINUTES = 15;
const MAX_OTP_ATTEMPTS = 5;
const OTP_COOLDOWN_SECONDS = 60; // 60s cooldown between requests to prevent spam

/**
 * Generate a cryptographically secure 6-digit OTP, store its hash in MongoDB,
 * and dispatch it via Gmail / emailService.
 */
export async function generateAndSendOTP(
  email: string,
  purpose: OTPPurpose,
  ipAddress?: string
): Promise<{ message: string; cooldownSeconds: number }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Rate-limit check: Has an active OTP been generated recently?
  const recentOtp = await OTP.findOne({
    email: normalizedEmail,
    purpose,
    isUsed: false,
    createdAt: { $gt: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000) },
  });

  if (recentOtp) {
    const waitTime = Math.ceil(
      (recentOtp.createdAt.getTime() + OTP_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
    );
    throw new BadRequestError(
      `Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before requesting another verification code.`
    );
  }

  // 2. Invalidate previous unused OTPs for this email + purpose
  await OTP.updateMany(
    { email: normalizedEmail, purpose, isUsed: false },
    { $set: { isUsed: true } }
  );

  // 3. Generate secure 6-digit numeric OTP
  const rawNumber = crypto.randomInt(100000, 999999);
  const plainOtp = rawNumber.toString();

  // 4. Hash OTP with bcrypt
  const otpHash = await bcrypt.hash(plainOtp, 10);

  // 5. Save to database with 5 min TTL
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);
  await OTP.create({
    email: normalizedEmail,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
    isUsed: false,
    ipAddress,
  });

  // 6. Send OTP via Gmail
  await sendOTPEmail(normalizedEmail, plainOtp, purpose);
  logger.info(`OTP generated & dispatched for ${normalizedEmail} (purpose: ${purpose})`);

  return {
    message: `A 6-digit verification code has been dispatched to ${normalizedEmail}. Valid for ${OTP_EXPIRES_MINUTES} minutes.`,
    cooldownSeconds: OTP_COOLDOWN_SECONDS,
  };
}

/**
 * Verify a 6-digit OTP against the stored bcrypt hash.
 */
export async function verifyOTP(
  email: string,
  plainOTP: string,
  purpose: OTPPurpose
): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedOtp = plainOTP.trim();

  // 1. Find the latest valid OTP document
  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new BadRequestError('Verification code has expired or was not requested. Please request a new code.');
  }

  // 2. Check maximum attempts
  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    otpRecord.isUsed = true;
    await otpRecord.save();
    throw new BadRequestError('Too many incorrect attempts. For security, please request a new verification code.');
  }

  // 3. Compare hash
  const isMatch = await bcrypt.compare(trimmedOtp, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    const remaining = MAX_OTP_ATTEMPTS - otpRecord.attempts;
    throw new BadRequestError(
      `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
    );
  }

  // 4. Mark as consumed
  otpRecord.isUsed = true;
  await otpRecord.save();
  logger.info(`OTP successfully verified for ${normalizedEmail} (${purpose})`);

  return true;
}

