import { ObjectId } from "mongodb";
import {
	IUser,
	USER_LEVELS
} from "../../src/database/models/User";

export const users: IUser[] = [
	{
		_id: new ObjectId(),
		firstName: "John",
		lastName: "Doe",
		userName: "jdoe",
		email: "jdoe@example.com",
		password: "123456",
		birth: new Date("1980/01/01"),
		level: USER_LEVELS.REGULAR,
		tokens: [],
	},
];
