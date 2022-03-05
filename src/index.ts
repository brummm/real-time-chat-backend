import { createSocket } from "./socket";
import fs from "fs";
import path from "path";
import { createApp } from "./app";

const port = process.env.PORT || 3301;
process.on("uncaughtException", (err) => {
	console.error(`${new Date().toUTCString()} uncaughtException:`, err);
	process.exit(0);
});

process.on("unhandledRejection", (err) => {
	console.error(`${new Date().toUTCString()} unhandledRejection:`, err);
});

// Reading routes directory to auto import route functions
const routeFiles = fs.readdirSync(path.join(__dirname, "routers"));
const routes = routeFiles.map(
	(file) => require(path.join(__dirname, "routers", file)).default
);

const app = createApp(port, routes);
const { server } = app;
createSocket(server);
app.start();
