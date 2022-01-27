import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { model, Schema, Document, Model, ObjectId } from "mongoose";
import validator from "validator";

export const USER_LEVELS = {
	ADMIN: "admin",
	REGULAR: "regular",
};

export const MAX_USERNAME_LENGTH = 15;

interface IToken {
	token: string;
}
export interface IUser {
	firstName: string;
	lastName: string;
	fullName?: string;
	userName: string;
	level: string;
	email: string;
	password: string;
	birth: Date;
	tokens: IToken[];
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
		firstName: {
			type: String,
			required: [true, 'O campo "nome" é obrigatório'],
			trim: true,
		},
		lastName: {
			type: String,
			trim: true,
		},
		userName: {
			type: String,
			trim: true,
			max: [
				MAX_USERNAME_LENGTH,
				`O usuário não pode ter mais que ${MAX_USERNAME_LENGTH} caracteres.`,
			],
			unique: true,
		},
		level: {
			type: String,
			required: true,
			trim: true,
			enum: USER_LEVELS,
			default: USER_LEVELS.REGULAR,
		},
		email: {
			type: String,
			required: [true, 'O campo "e-mail" é obrigatório'],
			trim: true,
			lowercase: true,
			unique: true,
			validate: {
				validator: function (value: string) {
					return validator.isEmail(value);
				},
				message: (props) => 'O campo "e-mail" é obrigatório',
			},
		},
		password: {
			type: String,
			required: [true, 'O campo "senha" é obrigatório'],
			trim: true,
			minlength: 6,
			max: 30,
		},
		birth: {
			type: Date,
			required: [true, 'O campo "data de nascimento" é obrigatório'],
			max: [
				new Date(),
				'Você preencheu o campo "data de nascimento" com um valor inválido.',
			],
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

userSchema.methods.generateAuthToken = async function (
	equipmentId: string
): Promise<string> {
	const user = this;

	const token: string = jwt.sign(
		{ _id: user._id.toString(), equipmentId },
		<string>process.env.JWT_SECRET,
		{
			expiresIn: "7 days",
		}
	);

	user.tokens = user.tokens.concat({ token });
	await user.save();

	return token;
};

userSchema.methods.toJSON = function () {
	const user = this;

	const publicProfile: any = {};
	const publicData = [
		"id",
		"firstName",
		"lastName",
		"userName",
		"email",
		"level",
		"birth",
	];
	publicData.forEach(($public) => (publicProfile[$public] = user[$public]));

	return publicProfile;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("Unable to login");
	}

	const isMatch = await bcrypt.compare(password, user.password);
	if (!isMatch) {
		throw new Error("Unable to login");
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
	return User.find({ level: USER_LEVELS.REGULAR });
};

userSchema.statics.alreadyExistsWithSameEmail = async (email) => {
	const user = await User.findOne({ email });
	return user !== null;
};

// Hashing password before saving
userSchema.pre("save", async function (next) {
	const user = this;

	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
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
