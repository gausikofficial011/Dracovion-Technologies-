import crypto from 'crypto';
import { env } from '../config/env';

// Derive a 32-byte key from session secret
const SALT = 'dracovion_vault_salt_2026';
const KEY = crypto.scryptSync(env.SESSION_SECRET || 'dracovion_dev_session_secret_ultra_secure_change_in_production_98127391283', SALT, 32);
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypts an employee's initial/reset password so Super Admin can retrieve it if forgotten.
 * Only applied to employee accounts.
 */
export function encryptEmployeePassword(plaintext: string): string {
  if (!plaintext) return '';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an employee's password for Super Admin recovery viewing.
 */
export function decryptEmployeePassword(ciphertext: string): string {
  if (!ciphertext) return '';
  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) return '';
    const [ivHex, authTagHex, encryptedHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

/**
 * Generates a strong, memorable employee password format:
 * e.g. "Dracovion-Apex-7492!" or "Quantum-Falcon-2026#"
 */
export function generateStrongMemorablePassword(): string {
  const prefixes = ['Dracovion', 'Quantum', 'Nexus', 'Apex', 'Cyber', 'Titan', 'Vanguard', 'Hyperion', 'Aero', 'Solaris'];
  const nouns = ['Falcon', 'Dragon', 'Shield', 'Pioneer', 'Matrix', 'Vector', 'Spark', 'Forge', 'Sentinel', 'Pulse'];
  const symbols = ['!', '@', '#', '$', '%'];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];

  return `${prefix}-${noun}-${num}${symbol}`;
}

