import { ObjectId } from "mongodb";

import {
	IUser,
	signInToken,
	USER_LEVELS,
} from "../../src/database/models/User";

const loggedUserId = new ObjectId('6209109926f6ff73645d949a');
const loggedUserToken = signInToken(loggedUserId, "equipmentId");
export const loggedUser = {
	_id: loggedUserId,
	firstName: "Logged",
	lastName: "In",
	userName: "loggedIn",
	email: "jdoe@example.com",
	password: "123456",
	birth: new Date("1980/01/01"),
	level: USER_LEVELS.REGULAR,
	tokens: [{ token: loggedUserToken }],
};

export const users: IUser[] = [
	{
		_id: new ObjectId('6209109926f6ff73645d9498'),
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
	{
		_id: new ObjectId('6209109926f6ff73645d9497'),
		firstName: "Another",
		lastName: "User",
		userName: "anotherUser",
		email: "another@example.com",
		password: "654321",
		birth: new Date("1980/01/01"),
		level: USER_LEVELS.REGULAR,
		tokens: [],
	},
	{
		_id: new ObjectId('6209109926f6ff73645d9499'),
		firstName: "John",
		lastName: "User",
		userName: "johnUser",
		email: "john-user@example.com",
		password: "654321",
		birth: new Date("1980/01/01"),
		level: USER_LEVELS.REGULAR,
		tokens: [],
	},
];
