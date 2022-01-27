import { Request, Response, Router } from "express";
import { createAccessTokenCookie } from "../middleware/auth";
import userResolver from "../resolvers/user-resolver";

export const UserRouter = Router();

const PREFIX = "/users";

UserRouter.get(PREFIX, (req: Request, res: Response) => {
	res.send({
		name: "Hello",
		lastName: "World",
	});
});



UserRouter.post(`${PREFIX}/register`, async (req: Request, res: Response) => {
	try {
		const { user: userData, equipmentId } = req.body;
		const { firstName, lastName, userName, email, password, birth } = userData;

		const create = await userResolver.createUser(
			{
				firstName,
				lastName,
				userName,
				email,
				password,
				birth,
			},
			equipmentId
		);

		if (create === undefined) {
			throw new Error("Username is already taken.");
		}

		const { user, token } = create;

		createAccessTokenCookie(token, res);

		res.status(201).send({ user });
	} catch (e: any) {
		res.status(400).send({ error: e.message });
	}
});

UserRouter.post(`${PREFIX}/login`, async (req: Request, res: Response) => {
	try {
		console.log(req.cookies);
		throw Error('')

		// const { email, password, equipmentId } = req.body;
		// if (!email || !password) {
		// 	throw new Error("Invalid username and/or password.");
		// }

		// const login = await userResolver.login(email, password, equipmentId);

		// if (login === null) {
		// 	throw new Error('There is no user with such credentials.')
		// }

		// const { user, token } = login;
		// createAccessTokenCookie(token, res);
		// return res.status(200).send({ user });
	} catch (e: any) {
		res.status(400).send({ error: e.message });
	}
});
