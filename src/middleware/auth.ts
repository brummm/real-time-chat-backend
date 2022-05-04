import { parse } from "cookie";
import { CookieOptions, NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { isDevelopment } from "../common/server";
import { IUserDocument, User, USER_ROLES } from "../database/models/User";
import psl from "psl";

export const ACCESS_TOKEN_COOKIE_NAME = "token";
export const UNAUTHORIZED = {
	message: "Please, authenticate.",
	httpStatusCode: 401,
};

declare module "express-serve-static-core" {
	export interface Request {
		user?: IUserDocument;
		token?: string;
	}
}

const getTokenFromRequest = (req: Request): any => {
	return req.cookies[ACCESS_TOKEN_COOKIE_NAME];
};

const findUserByToken = async (
	token: string
): Promise<IUserDocument | null> => {
	const { _id } = <JwtPayload>jwt.verify(token, <string>process.env.JWT_SECRET);
	return await User.findOne({ _id });
};

const validateTokenAndReturnUser = async (
	token: string
): Promise<IUserDocument> => {
	const user = await findUserByToken(token);

	if (!user) {
		throw new Error(UNAUTHORIZED.message);
	}

	const foundToken = user!.tokens.find((_token) => token == _token.token);
	if (!foundToken) {
		throw new Error(UNAUTHORIZED.message);
	}

	return user;
};

export const getAutheticatedUser = async (
	req: Request
): Promise<IUserDocument | null> => {
	try {
		const token = getTokenFromRequest(req);
		const user = await findUserByToken(token);
		return user;
	} catch (e) {
		console.error(e);
		return null;
	}
};

const addAuthToRequest = (
	req: Request,
	user: IUserDocument,
	token: string
): void => {
	req.user = user;
	req.token = token;
};

export const auth = async (
	req: Request | any,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) throw Error();
		const user = await validateTokenAndReturnUser(token);
		addAuthToRequest(req, user, token);
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
		const user = await validateTokenAndReturnUser(token);
		addAuthToRequest(req, user, token);
		next();
	} catch (e) {
		console.error(e);
		next(e);
	}
};

export const adminAuth = async (
	req: Request | any,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = getTokenFromRequest(req);
		if (!token) throw Error();
		const user = await validateTokenAndReturnUser(token);
		if (user.role !== USER_ROLES.MANAGER) {
			throw Error(`User is not admin. ${user}`);
		}
		addAuthToRequest(req, user, token);
		next();
	} catch (e) {
		console.error(e);
		res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
		res
			.status(UNAUTHORIZED.httpStatusCode)
			.send({ error: UNAUTHORIZED.message });
	}
};

export const putUserInReq = async (
	req: Request | any,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = getTokenFromRequest(req);
		if (token) {
			const user = await findUserByToken(token);
			if (user) {
				addAuthToRequest(req, user, token);
			}
		}
	} finally {
		next();
	}
};

const getDateDaysInFuture = (days: number): Date => {
	const date = new Date();
	date.setDate(date.getDate() + days);
	return date;
};

const getDomainFromOrigin = (origin: string): string | undefined => {
	const originHost = origin.split("/")[2];
	return psl.get(originHost) || undefined;
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
		const origin = req.get("origin");
		if (origin) {
			const domain = getDomainFromOrigin(origin);
			if (domain) cookieOptions.domain = domain;
		}
	}
	res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, cookieOptions);
};

export const deleteAccessTokenCookie = (res: Response) => {
	res.clearCookie(ACCESS_TOKEN_COOKIE_NAME);
};

export default auth;
