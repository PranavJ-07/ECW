/**
 * Seeds a demo college for local development.
 * Run: npx tsx scripts/seed-college.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CollegeModel } from '../src/infrastructure/database/models/college.model';

dotenv.config();

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await mongoose.connect(uri);

  const existing = await CollegeModel.findOne({ slug: 'mit' });
  if (existing) {
    console.log('College "mit" already exists — skipping');
    await mongoose.disconnect();
    return;
  }

  await CollegeModel.create({
    name: 'Massachusetts Institute of Technology',
    slug: 'mit',
    allowedEmailDomains: ['mit.edu'],
    isActive: true,
  });

  console.log('Seeded college: mit (allowed domain: mit.edu)');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
