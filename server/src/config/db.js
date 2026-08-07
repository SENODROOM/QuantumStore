import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer;

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  const useMemory =
    process.env.USE_MEMORY_DB !== 'false' || !uri || uri === 'memory';

  if (useMemory) {
    memoryServer = await MongoMemoryServer.create();
    const memoryUri = memoryServer.getUri('quantumstore');
    await mongoose.connect(memoryUri);
    console.log('MongoDB connected (in-memory)');
    return;
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
