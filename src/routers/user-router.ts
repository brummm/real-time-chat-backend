import { Request, Response, Router } from "express";
import {
	SIGNIN_ERROR,
	User,
	userRoleExists,
	USER_ROLES,
} from "../database/models/User";
import auth, {
	adminAuth,
	createAccessTokenCookie,
	deleteAccessTokenCookie,
	getAutheticatedUser,
} from "../middleware/auth";
import userService, { logout } from "../services/user-service";

const UserRouter = Router();

const PREFIX = "/users";

UserRouter.get(PREFIX, async (req: Request, res: Response) => {
	try {
		const users = await User.find({});
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
			//TODO: Check error
			throw new Error("Username is already taken.");
		}

		const { user, token } = create;

		createAccessTokenCookie(token, req, res);

		res.status(201).send({ user });
	} catch (e: any) {
		console.log(e);
		res.status(400).send({ error: e.message });
	}
});

UserRouter.post(`${PREFIX}/login`, async (req: Request, res: Response) => {
	try {
		const authenticated = await getAutheticatedUser(req);
		if (authenticated) {
			res.status(200).send({ user: authenticated });
			return;
		}
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

UserRouter.post(
	`${PREFIX}/logout`,
	auth,
	async (req: Request, res: Response) => {
		try {
			if (!req.user || !req.token) {
				res.sendStatus(400);
				return;
			}
			await logout(req.user, req.token);
			deleteAccessTokenCookie(res);
			res.status(200).send({ success: true, user: req.user });
		} catch (e) {
			console.error(e);
			res.status(500).send();
		}
	}
);

UserRouter.get(
	`${PREFIX}/session`,
	auth,
	async (req: Request, res: Response) => {
		res.status(200).send({ success: true, user: req.user });
	}
);

UserRouter.get(
	`${PREFIX}/profile/:userName`,
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

			res.status(404).send({ error: "User not found." });
		}
	}
);

UserRouter.get(PREFIX, adminAuth, async (req: Request, res: Response) => {
	try {
		const { limit = 20, skip = 0 } = req.params;
		const users = await User.find()
			.limit(Number(limit))
			.skip(Number(skip))
			.sort({ createdAt: "desc" });
		const total = await User.countDocuments();
		res.send({ users, total });
	} catch (e: any) {
		console.error(e);
		res.status(500).send();
	}
});

UserRouter.post(PREFIX, adminAuth, async (req: Request, res: Response) => {
	try {
		const { firstName, lastName, email, password, role } = req.body;
		if (!userRoleExists(role)) {
			res.status(400).send({ error: `Role "${role}" is invalid.` });
		}
		const user = new User({ firstName, lastName, email, password, role });
		await user.save();
		res.send({ user });
	} catch (e: any) {
		console.error(e);
		res.status(500).send();
	}
});

UserRouter.put(
	`${PREFIX}/:id`,
	adminAuth,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user) {
				res.status(404).send({ error: "User not found." });
				return;
			}

			const { firstName, lastName, email, role } = req.body;
			if (!userRoleExists(role)) {
				res.status(400).send({ error: `Role "${role}" is invalid.` });
			}

			const newData = { firstName, lastName, email, role };
			await user.update(newData);
			res.send({ user: await User.findById(id) });
		} catch (e: any) {
			console.error(e);
			res.status(500).send();
		}
	}
);

UserRouter.get(
	`${PREFIX}/roles`,
	adminAuth,
	async (req: Request, res: Response) => {
		try {
			res.send({ roles: Object.values(USER_ROLES) });
		} catch (e: any) {
			console.error(e);
			res.status(500).send();
		}
	}
);

UserRouter.get(
	`${PREFIX}/:id`,
	adminAuth,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			const user = await User.findById(id);
			if (!user) {
				throw new Error();
			}

			res.status(200).send({ user });
		} catch (e) {
			console.log(e);

			res.status(404).send({ error: "User not found." });
		}
	}
);

UserRouter.delete(
	`${PREFIX}/:id`,
	adminAuth,
	async (req: Request, res: Response) => {
		try {
			const { id } = req.params;
			await User.deleteOne({ _id: id });
			res.status(204).send();
		} catch (e) {
			console.log(e);
			res.status(404).send({ error: "User not found." });
		}
	}
);

UserRouter.post(`${PREFIX}/start`, async (req: Request, res: Response) => {
	try {
		const adminUser = await User.findOne({ role: USER_ROLES.MANAGER });

		if (adminUser) {
			res.status(404).send();
		} else {
			const { password, email } = req.body;
			if (password === undefined || email === undefined) {
				res.status(400).send("You must inform e-email and password.");
			}
			const admin = new User({
				password,
				firstName: "Admin",
				lastName: "User",
				role: USER_ROLES.MANAGER,
				email,
			});

			await admin.save();
			res.status(201).send();
		}
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

export default UserRouter;
