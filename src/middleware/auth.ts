import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response, Router } from "express";
import { User, IUserDocument } from "../database/models/User";

export const ACCESS_TOKEN_COOKIE_NAME = "access_token";

export interface RequestWithAuth extends Request {
	user: IUserDocument;
	token: string;
}

export const auth = async (req: RequestWithAuth, res: Response, next: NextFunction) => {
	try {
		const token = <string>req.header("Authorization")?.replace("Bearer ", "");
		const { _id } = <JwtPayload>(
			jwt.verify(token, <string>process.env.JWT_SECRET)
		);
		const user = await User.findOne({ _id, tokens: { token } });

		if (!user) {
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
