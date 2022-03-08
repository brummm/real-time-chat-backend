import { parse } from "cookie";
import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isDevelopment } from "../common/server";
import { IUserDocument, User } from "../database/models/User";

export const ACCESS_TOKEN_COOKIE_NAME = "token";
export const UNAUTHORIZED = {
	message: "Please, authenticate.",
	httpStatusCode: 401,
};


declare module 'express-serve-static-core' {
	export interface Request {
		user?: IUserDocument;
		token?: string;
	}
}


const validateTokenAndSetRequestValues = async (
	token: string,
	req: Request
): Promise<IUserDocument> => {
	const { _id } = <JwtPayload>jwt.verify(token, <string>process.env.JWT_SECRET);
	const user = await User.findOne({ _id });

	if (!user) {
		throw new Error(UNAUTHORIZED.message);
	}

	const foundToken = user!.tokens.find((_token) => token == _token.token);
	if (!foundToken) {
		throw new Error(UNAUTHORIZED.message);
	}

	return user;
};

export const auth = async (
	req: Request | any,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
		const user = await validateTokenAndSetRequestValues(token, req);
		req.user = user;
		req.token = token;
		next();
	} catch (e) {
		console.error(e);
		res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
		res
			.status(UNAUTHORIZED.httpStatusCode)
			.send({ error: UNAUTHORIZED.message });
	}
};

export const authSocket = async (
	req: Request | any,
	res: any,
	next: NextFunction
) => {
	try {
		const token = parse(req.headers.cookie)[ACCESS_TOKEN_COOKIE_NAME];
		const user = await validateTokenAndSetRequestValues(token, req);
		req.user = user;
		req.token = token;
		next();
	} catch (e) {
		console.error(e);
		next(e);
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
		sameSite: "lax",
	};
	if (!isDevelopment()) {
		cookieOptions.domain = req.get("origin");
	}
	res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, cookieOptions);
};

export default auth;
