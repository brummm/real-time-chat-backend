import express, { Request, Response, Router } from "express";
import { connect } from "./database/mongoose";

export const createApp = (
	port: number | string,
	routers: Router[]
): { app: Express.Application; start: CallableFunction } => {
	const app = express();

	app.use(express.json());

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
