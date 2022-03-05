import { Server } from "socket.io";

export default (io: Server) => {
	const chatNamespace = io.of("/chat");
	chatNamespace.on("connection", (socket: any) => {
		console.log(`connected into chat ${socket.id}`);
		socket.on("sendMessage", (data: string, chatId: string) => {
			console.log(data);
		});
	});
};
