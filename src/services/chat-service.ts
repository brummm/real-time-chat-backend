import { ObjectId } from "mongodb";
import { Chat, IChatDocument, IChatMessage } from "../database/models/Chat";
import { USERS_PUBLIC_DATA } from "../database/models/User";

export default {
	async listChats(userId: ObjectId): Promise<IChatDocument[]> {
		return await Chat.find({ users: userId }, { messages: { $slice: -5 } })
			.sort({ updatedAt: -1 })
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

	async createOrReturnChat(
		userIds: string[],
		message?: IChatMessage
	): Promise<{ chat: IChatDocument }> {
		let chat = await Chat.findOne({ users: userIds });
		if (chat) {
			const messages = chat.messages;
			if (message) {
				messages.push(message);
				await chat.save();
			}
		} else {
			const messages = [];
			if (message) messages.push(message);
			chat = new Chat({
				users: userIds.map((id) => new ObjectId(id)),
				messages,
			});
			await chat.save();
		}
		return { chat };
	},

	async respondToChat(
		chatId: string,
		message: IChatMessage
	): Promise<IChatMessage | null> {
		const chat = await Chat.findById(chatId);
		if (
			!chat ||
			!chat.users.some(
				(userId) => userId.toString() === message.owner.toString()
			)
		) {
			return null;
		}
		chat.messages.push(message);
		await chat.save();
		return chat.messages[chat.messages.length - 1];
	},
};
