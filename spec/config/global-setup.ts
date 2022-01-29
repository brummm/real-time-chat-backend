import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const clearPreviousDatabase = async () => {
	await mongoose.connect(
		`${process!.env!.MONGO_URI!}/${process.env.DATABASE_NAME}`,
		{}
	);
	await mongoose.connection.db.dropDatabase();
	await mongoose.disconnect();
};

export const globalSetup = async () => {
	const { IN_MEMORY_DATABASE, DATABASE_HOST, DATABASE_PORT } = process.env;
	if (IN_MEMORY_DATABASE === "true") {
		const instance = new MongoMemoryServer({
			instance: {
				dbName: process.env.DATABASE_NAME,
			},
		});
		await instance.start();
		const uri = instance.getUri();
		(global as any).__MONGOINSTANCE = instance;
		process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf("/"));
	} else {
		process.env.MONGO_URI = `mongodb://${DATABASE_HOST}:${DATABASE_PORT}`;
	}

	await clearPreviousDatabase();
};

export default globalSetup;
