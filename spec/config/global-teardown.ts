import { MongoMemoryServer } from "mongodb-memory-server";

export async function globalTeardown() {
	const { IN_MEMORY_DATABASE } = process.env;
	if (IN_MEMORY_DATABASE === "true") {
		const instance: MongoMemoryServer = (global as any).__MONGOINSTANCE;
		await instance.stop();
	}
}

export default globalTeardown;
