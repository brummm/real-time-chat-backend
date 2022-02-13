import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isDevelopment } from "../common/server";
import { IUserDocument, User } from "../database/models/User";

export const ACCESS_TOKEN_COOKIE_NAME = "token";
export const UNAUTHORIZED = {
	message: "Please, authenticate.",
	httpStatusCode: 401,
};

export interface RequestWithAuth extends Request {
	user: IUserDocument;
	token: string;
}

export const auth = async (
	req: RequestWithAuth | any,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.cookies[ACCESS_TOKEN_COOKIE_NAME];

		const { _id } = <JwtPayload>(
			jwt.verify(token, <string>process.env.JWT_SECRET)
		);
		const user = await User.findOne({ _id });

		if (!user) {
			throw new Error();
		}

		const foundToken = user!.tokens.find((_token) => token == _token.token);
		if (!foundToken) {
			throw new Error();
		}

		req.token = token;
		req.user = user;
		next();
	} catch (e) {
		res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
		res
			.status(UNAUTHORIZED.httpStatusCode)
			.send({ error: UNAUTHORIZED.message });
	}
};

const getDateDaysInFuture = (days: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date;
};

export const createAccessTokenCookie = (
	token: string,
	req: Request,
	res: Response
): void => {
	const cookieOptions: CookieOptions = {
		secure: true,
		httpOnly: true,
		expires: getDateDaysInFuture(7),
	};
	if (!isDevelopment()) {
		cookieOptions.domain = req.get("origin");
	}
	res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, cookieOptions);
};

export default auth;
