import cookieParser from "cookie-parser";
import express, { Router } from "express";
import { connect } from "./database/mongoose";
import cors from "cors";

export const createApp = (
	port: number | string,
	routers: Router[]
): { app: Express.Application; start: CallableFunction } => {
	const app = express();

	app.use(express.json());
	app.use(cookieParser());
	// app.use(cors());

	app.use(function (req, res, next) {
		// allow from any domain
		res.setHeader(
			"Access-Control-Allow-Origin",
			<string>process.env.FRONTEND_URL
		);

		// http verbs allowed
		res.setHeader(
			"Access-Control-Allow-Methods",
			"GET, POST, OPTIONS, PUT, PATCH, DELETE"
		);

		// Request headers you wish to allow
		res.setHeader(
			"Access-Control-Allow-Headers",
			"Origin, X-Requested-With, Content-Type, Accept"
		);

		// Set to true if you need the website to include cookies in the requests sent
		// to the API (e.g. in case you use sessions)
		res.setHeader("Access-Control-Allow-Credentials", "true");

		next();
	});

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
