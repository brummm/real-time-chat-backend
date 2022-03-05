import { createApp } from "../src/app";
import ChatRouter from "../src/routers/chat-router";
import request from "supertest";
import {
	getLoggedUserAndCookieString,
	shouldValidateAuth,
} from "./common/common";
import { users, loggedUser } from "./fixtures/users";
import { ObjectId } from "mongodb";
import chats from "./fixtures/chats";
import { Chat } from "../src/database/models/Chat";

describe("Chat Route tests", () => {
	let app: Express.Application;

	beforeAll(async () => {
		const createdApp = createApp(9999, [ChatRouter]);
		app = createdApp.app;
	});

	describe("/chats", () => {
		it("Should list all chats from a user", async () => {
			const chatsFromLoggedUser = chats.filter((chat) =>
				chat.users.some(
					(user) => user.userId.toString() === loggedUser._id.toString()
				)
			);

			const { user, cookieString } = getLoggedUserAndCookieString();
			const response = await request(app)
				.get("/chats")
				.set("Cookie", cookieString)
				.expect(200)
				.expect(({ body }) => {
					expect(body.chats.length).toEqual(chatsFromLoggedUser.length);
				});
		});

		it("Should not return the chats if a user is not logged in", () => {
			shouldValidateAuth(request, "/chats");
		});
	});

	describe("/chats/start", () => {
		it("Should create a new chat", async () => {
			const { user, cookieString } = getLoggedUserAndCookieString();
			const secondUser = users[0];
			const response = await request(app)
				.post("/chats/start")
				.set("Cookie", cookieString)
				.send({
					userIds: [secondUser._id],
					message: "Hello, World!",
				})
				.expect(201)
				.expect(({ body }) => {
					// the current logged user has to be in the users on the chat even though he wasn`t informe into the endpoint call
					expect(
						body.users.find(
							({ userId }: { userId: string }) => userId === user._id.toString()
						)
					).not.toBeUndefined();
					expect(body._id).not.toBeUndefined();
				});
		});
	});

	describe("/chats/respond", () => {
		it("Should respond to a given chat", async () => {
			const { user, cookieString } = getLoggedUserAndCookieString();
			const originalChat = chats[0];
			const response = await request(app)
				.post("/chats/respond")
				.set("Cookie", cookieString)
				.send({
					chatId: originalChat._id,
					message: "Hello, World!",
				})
				.expect(200)
				.expect(({ body }) => {
					expect(body.messages[0].createdAt).not.toBeUndefined();
				});
			const chat = await Chat.findById(originalChat._id);
			expect(chat?.messages.length).toEqual(originalChat.messages.length + 1);
		});

		it("Should not be able to respond to a chat that the user does not belong", async () => {
			const { user, cookieString } = getLoggedUserAndCookieString();
			const originalChat = chats[1];
			const response = await request(app)
				.post("/chats/respond")
				.set("Cookie", cookieString)
				.send({
					chatId: originalChat._id,
					message: "Hello, World!",
				})
				.expect(400);
			const chat = await Chat.findById(originalChat._id);
			expect(chat?.messages.length).toEqual(originalChat.messages.length);
		});
	});
});
