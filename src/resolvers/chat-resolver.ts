import { Chat, IChatDocument, IChatMessage } from "../database/models/Chat";
import { ObjectId } from "mongodb";
import { USERS_PUBLIC_DATA } from "../database/models/User";

export default {
	async listChats(userId: ObjectId): Promise<IChatDocument[]> {
		return await Chat.find({ users: userId })
			.lean()
			.populate("users", USERS_PUBLIC_DATA);
	},

	async getChatFromUser(
		chatId: string,
		userId: ObjectId
	): Promise<IChatDocument | null> {
		return await Chat.findOne({ _id: new ObjectId(chatId), users: userId })
			.lean()
			.populate("users", USERS_PUBLIC_DATA);
	},

	async createChat(
		userIds: string[],
		message?: IChatMessage
	): Promise<IChatDocument> {
		const messages = [];
		if (message) messages.push(message);
		const chat = new Chat({
			users: userIds.map((id) => new ObjectId(id)),
			messages,
		});
		await chat.save();
		return chat;
	},

	async respondToChat(
		chatId: string,
		message: IChatMessage
	): Promise<IChatDocument | null> {
		const chat = await Chat.findById(chatId);
		if (
			!chat ||
			!chat.users.some((user) => user.toString() === message.owner)
		) {
			return null;
		}
		chat.messages.push(message);
		await chat.save();
		return chat;
	},
};
