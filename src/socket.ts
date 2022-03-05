import fs from "fs";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import corsOptions from "./config/cors";

export const createSocket = (server: http.Server): Server => {
	const io = new Server(server, {
		cors: corsOptions,
	});

	io.on("connection", (socket: any) => {
		console.log(`connected ${socket.id}`);
	});

	const socketFiles = fs.readdirSync(path.join(__dirname, "socketNamespaces"));
	socketFiles.forEach((file) => {
		require(path.join(__dirname, "socketNamespaces", file)).default(io);
	});



	return io;
};
