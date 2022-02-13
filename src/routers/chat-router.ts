import { Response, Router } from "express";
import { IChatMessage } from "../database/models/Chat";
import auth, { RequestWithAuth } from "../middleware/auth";
import chatResolver from "../resolvers/chat-resolver";

export const ChatRouter = Router();

const PREFIX = "/chats";

ChatRouter.get(
	PREFIX,
	auth,
	async (req: RequestWithAuth | any, res: Response) => {
		try {
			const chats = await chatResolver.listChats(req.user._id);

			res.status(200).send({ chats });
		} catch (e) {
			console.error(e);
			res.status(500).send();
		}
	}
);

ChatRouter.post(
	`${PREFIX}/start`,
	auth,
	async (req: RequestWithAuth | any, res: Response) => {
		try {
			const {
				userIds,
				message,
			}: {
				userIds: string[];
				message: string;
			} = req.body;
			if (!userIds || !userIds.length || message === undefined) {
				throw new Error();
			}
			const owner = req.user.id;
			const chatMessage: IChatMessage = { message, owner };
			userIds.unshift(owner);
			const chat = await chatResolver.createChat(userIds, chatMessage);
			res.status(201).send(chat);
		} catch (e) {
			res.status(400).send();
		}
	}
);

ChatRouter.post(
	`${PREFIX}/respond`,
	auth,
	async (req: RequestWithAuth | any, res: Response) => {
		try {
			const { message, chatId, inResponseTo } = req.body;
			const owner = req.user.id;
			const chatMessage: IChatMessage = { message, owner, inResponseTo };
			const chat = await chatResolver.respondToChat(chatId, chatMessage);
			if (chat === null) {
				throw new Error();
			}
			return res.status(200).send(chat);
		} catch (e) {
			res.status(400).send();
		}
	}
);
