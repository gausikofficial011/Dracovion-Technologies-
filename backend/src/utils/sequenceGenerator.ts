import mongoose, { Schema, Model } from 'mongoose';

interface ISequenceCounter {
  _id: string;
  seq: number;
}

const SequenceCounterSchema = new Schema<ISequenceCounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true },
  },
  { versionKey: false }
);

const SequenceCounter: Model<ISequenceCounter> =
  mongoose.models.SequenceCounter ||
  mongoose.model<ISequenceCounter>('SequenceCounter', SequenceCounterSchema);

interface NextSequenceOptions {
  counterKey: string;
  model: Model<any>;
  field: string;
  prefix: string;
  padWidth?: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generates a monotonically increasing, collision-resistant prefixed sequence code
 * (e.g. DRV-2026-0004) that stays safe when historical records have been deleted
 * or when multiple requests create documents concurrently.
 *
 * Strategy:
 * 1. Scan all existing docs to find the current maximum suffix value.
 * 2. Atomically ensure the counter is at least at that value ($max).
 * 3. Atomically increment the counter ($inc) in a SINGLE findOneAndUpdate so
 *    concurrent callers each get a unique next value.
 */
export async function getNextSequenceCode({
  counterKey,
  model,
  field,
  prefix,
  padWidth = 4,
}: NextSequenceOptions): Promise<string> {
  const escapedPrefix = escapeRegex(prefix);

  // Step 1: find the max suffix currently in the collection
  const existingDocs = await model
    .find({ [field]: { $regex: `^${escapedPrefix}\\d+$` } })
    .select(field)
    .lean();

  let maxExisting = 0;
  for (const doc of existingDocs) {
    const raw = String((doc as any)?.[field] || '');
    const suffix = raw.slice(prefix.length);
    const parsed = parseInt(suffix, 10);
    if (Number.isFinite(parsed) && parsed > maxExisting) {
      maxExisting = parsed;
    }
  }

  // Step 2: Sync the counter to be >= maxExisting (protects against gaps/deletes).
  //         This is a best-effort sync and is non-atomic relative to step 3,
  //         but step 3 uses $inc which IS atomic. Any two concurrent callers
  //         both reach this point and may both set $max to the same value,
  //         then both $inc — giving them distinct results.
  if (maxExisting > 0) {
    await SequenceCounter.findOneAndUpdate(
      { _id: counterKey, seq: { $lt: maxExisting } },
      { $set: { seq: maxExisting } },
      { upsert: false }
    );

    // If the counter didn't exist yet, create it at maxExisting
    await SequenceCounter.updateOne(
      { _id: counterKey },
      { $setOnInsert: { seq: maxExisting } },
      { upsert: true }
    );
  }

  // Step 3: Atomically increment — this is the critical section.
  //         concurrent callers will each get a unique incremented value.
  const counter = await SequenceCounter.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const nextSeq = counter?.seq ?? maxExisting + 1;
  return `${prefix}${String(nextSeq).padStart(padWidth, '0')}`;
}
