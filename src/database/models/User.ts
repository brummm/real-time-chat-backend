import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { model, Schema, Document, Model, ObjectId } from "mongoose";
import mongodb from "mongodb";
import validator from "validator";

export const USER_ROLES = {
	MANAGER: "manager",
	USER: "user",
};

export const userRoleExists = (role: string): boolean => {
	return Object.values(USER_ROLES).findIndex((_role) => _role === role) !== -1;
};

export const MAX_USERNAME_LENGTH = 15;

interface IToken {
	token: string;
}
export interface IUser {
	_id?: any;
	firstName: string;
	lastName: string;
	fullName?: string;
	userName: string;
	role: string;
	email: string;
	password: string;
	birth: Date;
	tokens: IToken[];
	multiavatar?: string;
}

export interface IUserDocument extends IUser, Document {
	generateAuthToken: (equipmentId: string) => Promise<string>;
	canEdit: (id: ObjectId, what: string) => Promise<boolean>;
}

interface IUserModel extends Model<IUserDocument> {
	findByCredentials: (
		email: string,
		password: string
	) => Promise<IUserDocument>;
	alreadyExistsWithSameEmail: (email: string) => Promise<boolean>;
	generateUserNames: (firstName: string, lastName: String) => Promise<string[]>;
	findAllRegulars: () => Promise<IUserDocument[]>;
}

const userSchema = new Schema<IUserDocument>(
	{
		userName: {
			type: String,
			trim: true,
			max: [
				MAX_USERNAME_LENGTH,
				`O usuário não pode ter mais que ${MAX_USERNAME_LENGTH} caracteres.`,
			],
			unique: true,
		},
		firstName: {
			type: String,
			required: [true, "First name is required."],
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		role: {
			type: String,
			required: true,
			trim: true,
			enum: USER_ROLES,
			default: USER_ROLES.USER,
		},
		email: {
			type: String,
			required: [true, "E-mail is required."],
			trim: true,
			lowercase: true,
			unique: true,
			validate: {
				validator: function (value: string) {
					return validator.isEmail(value);
				},
				message: (props) => "E-mail is required.",
			},
		},
		password: {
			type: String,
			required: [true, "Password is required."],
			trim: true,
			minlength: 6,
			max: 30,
		},

		birth: {
			type: Date,
			required: [true, "Date of birth is required"],
			max: [new Date(), "Date of birth is invalid."],
		},
		multiavatar: {
			type: String,
			validate: {
				validator: function (value: string) {
					if (value.length !== 12) {
						return false;
					}
					if (!value.match(/^[0-9]+$/)) {
						return false;
					}
					return true;
				},
				message: (props) => "Avatar code is invalid.",
			},
		},
		tokens: [
			{
				token: {
					type: String,
					required: true,
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

export const signInToken = (
	id: mongodb.ObjectId,
	equipmentId: string
): string => {
	return jwt.sign(
		{ _id: id.toString(), equipmentId },
		<string>process.env.JWT_SECRET,
		{
			expiresIn: "7 days",
		}
	);
};

userSchema.methods.generateAuthToken = async function (
	equipmentId: string
): Promise<string> {
	const user = <IUserDocument>this;

	const token = signInToken(user._id, equipmentId);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

export const USERS_PUBLIC_DATA = [
	"_id",
	"firstName",
	"lastName",
	"userName",
	"multiavatar",
];

userSchema.methods.toJSON = function () {
	const user = this;

	const publicProfile: any = {};
	USERS_PUBLIC_DATA.forEach(
		($public) => (publicProfile[$public] = user[$public])
	);

	return publicProfile;
};

export const SIGNIN_ERROR = "Invalid e-mail and/or password.";
userSchema.statics.findByCredentials = async (
	email,
	password
): Promise<IUserDocument> => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error(SIGNIN_ERROR);
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error(SIGNIN_ERROR);
	}

	return user;
};

userSchema.statics.generateUserNames = async (firstName, lastName) => {
	let userNames: string[] = [];
	userNames.push(await userNameGenerator(firstName, lastName));
	userNames.push(await userNameGenerator(firstName, lastName, "."));
	userNames.push(await userNameGenerator(firstName, lastName, "-"));
	return userNames;
};

const userNameGenerator = async (
	firstName: string,
	lastName: string,
	separator = ""
): Promise<string> => {
	firstName = firstName.toLowerCase().trim().replace(/ /, "");
	lastName = lastName.toLowerCase().trim();

	const lastSpace = lastName.lastIndexOf(" ");
	if (lastSpace !== -1) {
		lastName = lastName.substring(lastSpace + 1);
	}

	const assembleUserName = () => {
		return `${firstName}${separator}${lastName}`;
	};
	let userName = assembleUserName();

	if (userNameIsBiggerThanAllowed(userName)) {
		firstName = firstName.substring(0, 1);
		userName = assembleUserName();
		if (userNameIsBiggerThanAllowed(userName)) {
			userName = userName.substring(0, MAX_USERNAME_LENGTH);
		}
	}

	let i = 1;
	do {
		let foundUser = await User.findOne({ userName });
		if (!foundUser) {
			break;
		}
		userName = userName + i;
		i++;
	} while (i < 10);

	return userName;
};

const userNameIsBiggerThanAllowed = (userName: string) => {
	return userName.length > MAX_USERNAME_LENGTH;
};

userSchema.methods.canEdit = async function (id: string, what: string) {
	//TODO: implementar
	return true;
};

userSchema.statics.findAllRegulars = async () => {
	return User.find({ role: USER_ROLES.USER });
};

userSchema.statics.alreadyExistsWithSameEmail = async (email) => {
	const user = await User.findOne({ email });
	return user !== null;
};

export const HASH_PASSWORD_SALT = 8;

// Hashing password before saving
userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, HASH_PASSWORD_SALT);
	}

	next();
});

// userSchema.virtual("chats", {
// 	ref: "Chat",
// 	localField: "_id",
// 	foreignField: "owner",
// });

userSchema
	.virtual("fullName")
	.get(function (this: { firstName: string; lastName: string }) {
		return `${this.firstName} ${this.lastName}`;
	});
export const User = model<IUserDocument, IUserModel>("User", userSchema);
