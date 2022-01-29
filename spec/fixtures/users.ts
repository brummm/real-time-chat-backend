import { ObjectId } from "mongodb";

import {
	IUser,
	signInToken,
	USER_LEVELS,
} from "../../src/database/models/User";

const loggedUserId = new ObjectId();
const loggedUserToken = signInToken(loggedUserId, "equipmentId");
export const loggedUser = {
	_id: loggedUserId,
	firstName: "John",
	lastName: "Doe",
	userName: "jdoe",
	email: "jdoe@example.com",
	password: "123456",
	birth: new Date("1980/01/01"),
	level: USER_LEVELS.REGULAR,
	tokens: [{ token: loggedUserToken }],
};

export const users: IUser[] = [
	{
		_id: new ObjectId(),
		firstName: "First",
		lastName: "Last",
		userName: "flast",
		email: "flast@example.com",
		password: "654321",
		birth: new Date("1980/01/01"),
		level: USER_LEVELS.REGULAR,
		tokens: [],
	},
	loggedUser,
];
