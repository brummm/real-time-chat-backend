import request from "supertest";
import {
	ACCESS_TOKEN_COOKIE_NAME,
	UNAUTHORIZED,
} from "../../src/middleware/auth";
import { loggedUser } from "../fixtures/users";

export const getLoggedUserAndCookieString = () => {
	const { token } = loggedUser.tokens[0];
	return {
		user: loggedUser,
		cookieString: [`${ACCESS_TOKEN_COOKIE_NAME}=${token}`],
	};
};

export const shouldValidateAuth = async (
	app: Express.Application,
	endpoint: string,
	config = {
		type: "get",
		parms: [],
		expectedStatus: UNAUTHORIZED.httpStatusCode,
	}
): Promise<void> => {
	const { type, parms, expectedStatus } = config;
	const req = request(app);
	if (type === "get") {
		await req.get(endpoint).expect(expectedStatus);
	} else {
		await req.post(endpoint).send(parms).expect(expectedStatus);
	}
};
