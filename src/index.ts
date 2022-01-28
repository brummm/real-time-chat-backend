import { connect } from "./database/mongoose";
import { createApp } from "./app";
import { UserRouter } from "./routers/user-router";

const port = process.env.PORT || 3301;
process.on("uncaughtException", (err) => {
	console.error(`${new Date().toUTCString()} uncaughtException:`, err);
	process.exit(0);
});

process.on("unhandledRejection", (err) => {
	console.error(`${new Date().toUTCString()} unhandledRejection:`, err);
});

createApp(port, [UserRouter], connect).start();
