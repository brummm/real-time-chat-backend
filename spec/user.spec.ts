import request from "supertest";
import { createApp } from "../src/app";
import { User } from "../src/database/models/User";
import { UserRouter } from "../src/routers/user-router";
import { start } from "./database/mongoose";

let app: Express.Application;

beforeAll(async () => {
	const connect = await start();
	const createdApp = createApp(9999, [UserRouter], connect);
	app = createdApp.app;
});

it("Should test a simple endpoint", async () => {
	const response = await request(app).get("/users").expect(200);
	expect(response.body).toMatchObject({
		name: "Hello",
		lastName: "World",
	});
});
