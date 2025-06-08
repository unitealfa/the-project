import mongoose from 'mongoose';
import { Client, ClientSchema } from '../src/client/schemas/client.schema';
import * as dotenv from 'dotenv';

dotenv.config();

async function run() {
  const uri = process.env.MONGO_URI || '';
  await mongoose.connect(uri);
  const ClientModel = mongoose.model(Client.name, ClientSchema);
  await ClientModel.updateMany(
    { points_since_last_repeat: { $exists: false } },
    { $set: { points_since_last_repeat: 0 } }
  );
  console.log('Migration done');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});