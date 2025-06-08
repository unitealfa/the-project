import mongoose from 'mongoose';
import { LoyaltyProgram, LoyaltyProgramSchema } from '../src/loyalty/schemas/program.schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || '';
  await mongoose.connect(uri);
  const ProgramModel = mongoose.model(LoyaltyProgram.name, LoyaltyProgramSchema);
  await ProgramModel.updateMany(
    { repeatRewards: { $exists: false } },
    { $set: { repeatRewards: [] } }
  );
  console.log('Migration done');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});