import express, { Request, Response, Router } from "express";
import { connect } from "./database/mongoose";
import cookieParser from 'cookie-parser';

export const createApp = (
	port: number | string,
	routers: Router[]
): { app: Express.Application; start: CallableFunction } => {
	const app = express();

	app.use(express.json());
	app.use(cookieParser())

	routers.forEach((router) => {
		app.use(router);
	});

	const start = () => {
		connect();

		app.listen(port, () => {
			console.log(`🚀 The application is listening on port ${port}!`);
		});
	};

	return { app, start };
};
