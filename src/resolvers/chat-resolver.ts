import { Chat, IChatDocument, IChatMessage } from "../database/models/Chat";
import { ObjectId } from "mongodb";
import { User } from "../database/models/User";

export default {
	async listChats(userId: ObjectId): Promise<IChatDocument[]> {
		return await Chat.find({ 'users.userId': userId });
	},

	async createChat(
		userIds: string[],
		message: IChatMessage
	): Promise<IChatDocument> {
		const chat = new Chat({
			users: userIds.map((id) => ({ userId: new ObjectId(id) })),
			messages: [message],
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
			!chat.users.some(({ userId }) => userId.toString() === message.owner)
		) {
			return null;
		}
		chat.messages.push(message);
		await chat.save();
		return chat;
	},
};
