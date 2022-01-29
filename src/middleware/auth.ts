import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { User, IUserDocument } from "../database/models/User";

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";

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
		res.status(401).send({ error: "Please, authenticate." });
	}
};

export const createAccessTokenCookie = (token: string, res: Response): void => {
	res.cookie(ACCESS_TOKEN_COOKIE_NAME, token, {
		secure: true,
		httpOnly: true,
	});
};

export default auth;
