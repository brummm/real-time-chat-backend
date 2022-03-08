import { Server } from "socket.io";
import { Chat, IChatMessage } from "../../database/models/Chat";
import { authSocket } from "../../middleware/auth";
import chatResolver from "../../resolvers/chat-resolver";

export default (io: Server, token: string) => {
	const chatNamespace = io.of("/chat");

	// @ts-ignore
	chatNamespace.use((socket, next) => authSocket(socket.request, {}, next));
	chatNamespace.on("connection", (socket: any) => {
		socket.on("joinChat", async (chatId: string) => {
			const { _id } = socket.request.user;
			const chat = await Chat.findOne({ _id: chatId, users: _id });

			if (chat) {
				socket.join(chatId);
			}
		});

		socket.on("sendMessage", async (message: string, chatId: string) => {
			try {
				const { user } = socket.request;
				const chatMessage: IChatMessage = {
					message,
					owner: user._id,
				};
				const newMessage = await chatResolver.respondToChat(chatId, chatMessage);
				console.log(newMessage);

				if (newMessage) {
					chatNamespace.in(chatId).emit("newMessage", newMessage);
				}
			} catch (e) {
				console.error(e);
			}
		});
	});

	chatNamespace.adapter.on("create-room", (room) => {
		console.log(`room ${room} was created`);
	});

	chatNamespace.adapter.on("join-room", (room, id) => {
		console.log(`socket ${id} has joined room ${room}`);
	});
};
