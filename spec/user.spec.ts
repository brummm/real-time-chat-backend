import { Chance } from "chance";
import { users, loggedUser } from "./fixtures/users";
import request from "supertest";
import { createApp } from "../src/app";
import { User } from "../src/database/models/User";
import { UserRouter } from "../src/routers/user-router";
import { ACCESS_TOKEN_COOKIE_NAME } from "../src/middleware/auth";
const chance = new Chance();

describe("User Route tests", () => {
	let app: Express.Application;

	beforeAll(async () => {
		const createdApp = createApp(9999, [UserRouter]);
		app = createdApp.app;
	});
	// it("Should test a simple endpoint", async () => {
	// 	const response = await request(app).get("/users").expect(200);
	// 	console.log(response.body);

	// 	expect(response.body).toMatchObject({
	// 		name: "Hello",
	// 		lastName: "World",
	// 	});
	// });

	describe("register", () => {
		it("Should register a new user", async () => {
			expect(await User.countDocuments()).toBe(users.length);
			const user = {
				firstName: "New",
				lastName: "User",
				userName: "newuser",
				email: "newuser@test.com",
				password: chance.string({ length: 8 }),
				birth: new Date(1980, 0, 1, 0, 0, 0).toString(),
			};
			const equipmentId = "equipmentId";
			await request(app)
				.post("/users/register")
				.send({
					user,
					equipmentId,
				})
				.expect(201)
				.expect(async ({ body }) => {
					const createdUser = body.user;
					expect(createdUser.email).toBe(user.email);
				});
			expect(await User.countDocuments()).toBe(users.length + 1);
		});
	});

	describe("login", () => {
		it("Should login the user and return itself and a token (the later via cookie)", async () => {
			const { email, password } = users[0];

			await request(app)
				.post("/users/login")
				.send({
					email,
					password,
					equipmentId: "equipmentId",
				})
				.expect(200)
				.expect(({ headers }) => {
					expect(headers["set-cookie"][0]).toContain(ACCESS_TOKEN_COOKIE_NAME);
				});

			const user = await User.findOne({ email });
			expect(user?.tokens.length).toBeGreaterThan(0);
		});
	});

	describe("/users/:userName", () => {
		it("Should get the queried user data if userName is found and the user is logged in", async () => {
			const { userName, email } = users[0];
			const { token } = loggedUser.tokens[0];
			await request(app)
				.get(`/users/${userName}`)
				.set("Cookie", [`${ACCESS_TOKEN_COOKIE_NAME}=${token}`])
				.expect(200)
				.expect(({ body }) => {
					expect(body.error).toBeUndefined();
					expect(body.user.email).toBe(email);
				});
		});
	});
});
