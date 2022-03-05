export default {
	credentials: true,
	origin: <string>process.env.FRONTEND_URL,
	allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept",
};
