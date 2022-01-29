import Fixtures from "node-mongodb-fixtures";
import { connect, disconnect } from "../../src/database/mongoose";

beforeAll(async () => {
	await connect();
});

beforeEach(async () => {
	const fixtures = new Fixtures({ dir: "./spec/fixtures/final/", mute: true });
	await fixtures.connect(<string>process.env.MONGO_URI, {
		// @ts-ignore
		useUnifiedTopology: true,
	});
	await fixtures.unload();
	await fixtures.load();
	await fixtures.disconnect();
});

afterAll(async () => {
	await disconnect();
});
