import { IUserDocument, User } from "../database/models/User";
import bcrypt from "bcryptjs";
import { Mongoose, Error } from "mongoose";

const stringToDate = (strDate: string): Date | null => {
	try {
		const finalDate = new Date(strDate);
		finalDate.setHours(0, 0, 0);
		return finalDate;
	} catch (e) {
		return null;
	}
};

export interface IUserDocumentWithToken {
	user: IUserDocument;
	token: string;
}

const createUser = async (
	data: {
		firstName: string;
		lastName: string;
		userName: string;
		email: string;
		password: string;
		birth: string;
	},
	equipmentId: string
): Promise<IUserDocumentWithToken | undefined> => {
	const formattedData = {
		...data,
		birth: stringToDate(data.birth),
	};
	try {
		const user = new User(formattedData);
		await user.save();
		const token = await user.generateAuthToken(equipmentId);
		return {
			user,
			token,
		};
	} catch (e: any) {
		Mongoose;
		if (e.code === 11000) {
			return undefined;
		}
		console.error(e);
		throw new Error("");
	}
};

const login = async (
	email: string,
	password: string,
	equipmentId: string
): Promise<IUserDocumentWithToken | null> => {
	const user = await User.findByCredentials(email, password);
	if (!user || !bcrypt.compareSync(password, user.password)) {
		return null;
	}
	const token = await user.generateAuthToken(equipmentId);
	return {
		user,
		token,
	};
};

export default {
	createUser,
	login,
};
