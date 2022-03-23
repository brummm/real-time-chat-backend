import { Request, Response, Router } from "express";
import { SIGNIN_ERROR } from "../database/models/User";
import auth, { createAccessTokenCookie } from "../middleware/auth";
import userService from "../services/user-service";

const UserRouter = Router();

const PREFIX = "/users";

UserRouter.get(PREFIX, async (req: Request, res: Response) => {
	try {
		const users = await userService.listUsers();
		res.send(users);
	} catch (e) {
		res.status(500).send("There was an error while trying to list users.");
	}
});

UserRouter.post(`${PREFIX}/register`, async (req: Request, res: Response) => {
	try {
		const { user: userData, equipmentId } = req.body;
		const { firstName, lastName, userName, email, password, birth } = userData;

		const create = await userService.createUser(
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

		// TODO: get equipmentId and call userResolver.login
		const { user, token } = create;

		createAccessTokenCookie(token, req, res);

		res.status(201).send({ user });
	} catch (e: any) {
		res.status(400).send({ error: e.message });
	}
});

UserRouter.post(`${PREFIX}/login`, async (req: Request, res: Response) => {
	try {
		const { email, password, equipmentId } = req.body;
		if (!email || !password) {
			throw new Error(SIGNIN_ERROR);
		}

		const login = await userService.login(email, password, equipmentId);

		const { user, token } = login!;
		createAccessTokenCookie(token, req, res);
		res.status(200).send({ user });
	} catch (e: any) {
		res.status(400).send({ error: e.message });
	}
});

UserRouter.get("/users/session", auth, async (req: Request, res: Response) => {
	res.status(200).send({ success: true, user: req.user });
});

UserRouter.get(
	"/users/profile/:userName",
	auth,
	async (req: Request, res: Response) => {
		try {
			const { userName } = req.params;
			const user = await userService.findByUserName(userName);
			if (!user) {
				throw new Error();
			}
			res.status(200).send({ user });
		} catch (e) {
			console.log(e);

			res.status(404).send({error: "User not found."});
		}
	}
);

export default UserRouter;
