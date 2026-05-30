import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL || "";

if (!MONGODB_URL) {
	throw new Error("Definisikan MONGODB_URL di .env.local");
}

declare global {
	var mongoose:
		| {
				conn: mongoose.Mongoose | null;
				promise: Promise<mongoose.Mongoose> | null;
		  }
		| undefined;
}

if (!global.mongoose) {
	global.mongoose = {
		conn: null,
		promise: null,
	};
}

const cached = global.mongoose;

async function connectDB() {
	if (cached.conn) return cached.conn;

	if (!cached.promise) {
		cached.promise = mongoose.connect(MONGODB_URL, {
			dbName: "ta-moderasi",
			bufferCommands: false,
			serverSelectionTimeoutMS: 5000,
		});
	}

	try {
		cached.conn = await cached.promise;
	} catch (error) {
		cached.promise = null;
		throw error;
	}

	return cached.conn;
}

export default connectDB;
