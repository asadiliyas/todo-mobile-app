import mongoose from "mongoose";

/**
 * Database connection helper.
 *
 * In production/preview (on Vercel) this connects to the real MongoDB
 * connection string, which is provisioned by the "MongoDB Atlas" Storage
 * integration (or set manually) as an environment variable.
 *
 * In local development, if no connection string is configured at all, we
 * fall back to an in-memory MongoDB instance (via `mongodb-memory-server`)
 * so the app runs with zero setup. That package is a devDependency only
 * and is imported dynamically, so it never ships in the production bundle.
 */

// Support a few common env var names so whichever the Storage integration
// (or the user) sets just works without extra back-and-forth.
function readConnectionString(): string | undefined {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URL
  );
}

export class DbNotConfiguredError extends Error {
  constructor() {
    super(
      "No database is configured. Set MONGODB_URI in the environment.",
    );
    this.name = "DbNotConfiguredError";
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServerUri?: string;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global.__mongooseCache ?? {
  conn: null,
  promise: null,
};
global.__mongooseCache = cache;

async function resolveUri(): Promise<string> {
  const configured = readConnectionString();
  if (configured) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new DbNotConfiguredError();
  }

  // Local dev, nothing configured: spin up (or reuse) an in-memory server.
  if (cache.memoryServerUri) return cache.memoryServerUri;

  const { MongoMemoryServer } = await import("mongodb-memory-server");
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri("todo-dev");
  cache.memoryServerUri = uri;
  console.warn(
    "[db] MONGODB_URI not set — using a temporary in-memory MongoDB for local dev.\n" +
      "     Data will NOT persist across restarts. Set MONGODB_URI to use a real database.",
  );
  return uri;
}

export async function dbConnect(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = resolveUri().then((uri) =>
      mongoose.connect(uri, {
        bufferCommands: false,
      }),
    );
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
