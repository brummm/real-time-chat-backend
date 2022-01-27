import mongoose from "mongoose";

export const connect = async () => {
	const {
		DATABASE_HOST: host,
		DATABASE_PORT: port,
		DATABASE_NAME: database,
		DATABASE_USER: username,
		DATABASE_PASSWORD: password,
		MONGO_URL,
	} = process.env;

	let connectionUrl = MONGO_URL;
	if (!connectionUrl) {
		if (
			host === undefined ||
			port === undefined ||
			database === undefined ||
			username === undefined ||
			password === undefined
		) {
			throw Error(
				"The needed vars to create the database connection url are not set in the environment."
			);
		} else {
			connectionUrl = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;
		}
		try {
			mongoose.connect(connectionUrl, {
				connectTimeoutMS: 10000,
			});
		} catch (e) {
			console.error(e);
		}
	}
};

export const disconnect = () => {
	mongoose.disconnect();
};
export default connect;
