export const isProduction = (): boolean => {
	return process.env.NODE_ENV === "prod";
};

export const isDevelopment = (): boolean => {
	return process.env.NODE_ENV === "dev";
};
