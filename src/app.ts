import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Router } from "express";
import http from "http";
import { Server } from "socket.io";
import { connect } from "./database/mongoose";
import { createSocket } from "./socket";
import corsOptions from './config/cors';


export const createApp = (
	port: number | string,
	routers: Router[]
): { app: Express.Application; server: http.Server; start: CallableFunction } => {
	const app = express();

	app.use(express.json());
	app.use(cookieParser());
	app.use(cors(corsOptions));

	routers.forEach((router) => {
		app.use(router);
	});

	const server = http.createServer(app);

	const start = () => {
		connect();

		server.listen(port, () => {
			console.log(`🚀 The application is listening on port ${port}!`);
		});
	};

	return { app, server, start };
};
