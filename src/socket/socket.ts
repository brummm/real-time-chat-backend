import { parse } from "cookie";
import { Request } from "express";
import fs from "fs";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import corsOptions from "../config/cors";

const connect = async (io: Server): Promise<string> => {
	let token: string;
	return new Promise((resolve) => {
		io.engine.on("headers", (headers: any, request: Request) => {
			if (!request.headers.cookie) return;

			token = parse(request.headers.cookie).token;
			resolve(token);
		});

		io.on("connection", (socket: any) => {
			console.log(`connected ${socket.id}`);
			socket.on("connect_error", (err: Error) => {
				console.log(err instanceof Error); // true
				console.log(err.message); // not authorized
			});
		});
	});
};

export const createSocket = async (server: http.Server): Promise<Server> => {
	const io = new Server(server, {
		cors: corsOptions,
	});

	const token = await connect(io);

	const socketFiles = fs.readdirSync(path.join(__dirname, "namespaces"));
	socketFiles.forEach((file) => {
		require(path.join(__dirname, "namespaces", file)).default(io, token);
	});

	return io;
};
