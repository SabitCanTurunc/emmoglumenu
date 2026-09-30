import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Lütfen .env dosyasına MONGODB_URI bilginizi ekleyin.');
}

// Add the database name 'emmoglumenu' if it's not already in the URI
// Wait, mongoose can take dbName in the connect options
const options = {
  dbName: 'emmoglumenu', // Bu, veritabanının adının "emmoglumenu" olmasını garantiler
  bufferCommands: false,
};

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, options).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
