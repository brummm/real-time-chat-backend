import connect from "../../src/database/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongod: MongoMemoryServer;

export const start = async () => {
	mongod = await MongoMemoryServer.create();
	process.env.MONG_URL = mongod.getUri();
	return connect;
};

export const end = async () => {
	if (mongod !== undefined) {
		await mongod.stop();
	}
};
