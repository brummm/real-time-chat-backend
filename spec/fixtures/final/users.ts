import bcrypt from "bcryptjs";
import { HASH_PASSWORD_SALT } from "../../../src/database/models/User";
import { users } from "../users";

module.exports = users.map((user) => ({
	...user,
	password: bcrypt.hashSync(user.password, HASH_PASSWORD_SALT),
}));
