import mongoose from "mongoose";

/**
 * Serverless-safe MongoDB connection.
 *
 * Route handlers can run in many short-lived instances, so the connection
 * promise is cached on `globalThis` and reused instead of reconnecting on
 * every request. A failed connection is logged and retried on the next
 * request rather than killing the process.
 */
type MongooseCache = { promise: Promise<typeof mongoose> | null };

const globalForMongoose = globalThis as typeof globalThis & {
  __mongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongoose.__mongoose ?? { promise: null };
globalForMongoose.__mongoose = cache;

export async function connect() {
  if (mongoose.connection.readyState === 1) return mongoose;

  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL is not set. Add it to your environment variables.");
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10_000 })
      .catch((error) => {
        cache.promise = null;
        console.error("MongoDB connection failed:", error?.message ?? error);
        throw error;
      });
  }

  return cache.promise;
}

// Start connecting as soon as a route module is loaded. Mongoose buffers
// queries until the connection is ready; failures are retried per request.
if (process.env.MONGO_URL) {
  connect().catch(() => {});
}
