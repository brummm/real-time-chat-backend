import bcrypt from "bcryptjs";
import { Error } from "mongoose";
import { IUserDocument, User } from "../database/models/User";

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
		multiavatar: generateRandomMultiAvatarCode(),
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
		console.error(e);
		if (e.code === 11000) {
			return undefined;
		}
		throw new Error("");
	}
};

function getRandomInt(min: number, max: number): number {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomMultiAvatarCode(): string {
	let rand = "";
	const min = 0;
	const max = 47;
	const totalParts = 6;
	for (let i = 0; i < totalParts; i++) {
		const randNumer = getRandomInt(min, max);
		rand += ("0" + randNumer).slice(-2);
	}
	return rand;
}

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

export const logout = async (
	user: IUserDocument,
	token: string
): Promise<boolean> => {
	try {
		user.tokens = user.tokens.filter((_token) => _token.token !== token);
		await user.save();
		return true;
	} catch (e) {
		console.error(e);
	}
	return false;
};

const findByUserName = async (
	userName: string
): Promise<IUserDocument | null> => {
	return User.findOne({ userName });
};

export default {
	createUser,
	login,
	findByUserName,
};
