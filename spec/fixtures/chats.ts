
import { ObjectId } from "mongodb";
import { IChat } from "../../src/database/models/Chat";
import { users, loggedUser } from "./users";

const loggedUserId = loggedUser._id;
const userOneId = users[0]._id;
const userTwoId = users[2]._id;
const userThreeId = users[3]._id;

export const chats: IChat[] = [
	{
		_id: new ObjectId(),
		users: [{ userId: loggedUserId }, { userId: userTwoId }],
		messages: [
			{
				message: "Hi!",
				owner: loggedUserId,
				_id: new ObjectId(),
			},
			{
				message: "Hi. Who`s there?",
				owner: userTwoId,
				_id: new ObjectId(),
			},
			{
				message: "Nobody.",
				owner: loggedUserId,
				_id: new ObjectId(),
			},
		],
	},
	{
		_id: new ObjectId(),
		users: [{ userId: userOneId }, { userId: userTwoId }],
		messages: [
			{
				message: "Hi!",
				owner: userOneId,
				_id: new ObjectId(),
			},
		],
	},
	{
		_id: new ObjectId(),
		users: [{ userId: loggedUserId }, { userId: userThreeId }],
		messages: [
			{
				message: "What's up?",
				owner: loggedUserId,
				_id: new ObjectId(),
			},
		],
	},
];
export default chats;
