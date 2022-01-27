import express, { Request, Response } from "express";
import { UserRouter } from "./routers/user-router";
import { connect } from "./database/mongoose";

const app = express();

app.get("/", (req: Request, res: Response) => {
	res.send("hello world.");
});

app.use(express.json());

app.use(UserRouter);

const port = process.env.PORT || 3301;
process.on("uncaughtException", (err) => {
	console.error(`${new Date().toUTCString()} uncaughtException:`, err);
	process.exit(0);
});

process.on("unhandledRejection", (err) => {
	console.error(`${new Date().toUTCString()} unhandledRejection:`, err);
});

const start = async () => {
	connect();

	app.listen(port, () => {
		console.log(`🚀 The application is listening on port ${port}!`);
	});
};

start();
