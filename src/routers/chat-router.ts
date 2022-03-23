import { Response, Router } from "express";
import { IChatMessage } from "../database/models/Chat";
import auth from "../middleware/auth";
import chatService from "../services/chat-service";

const ChatRouter = Router();

const PREFIX = "/chats";

ChatRouter.get(
	PREFIX,
	auth,
	async (req: Request | any, res: Response) => {
		try {
			const chats = await chatService.listChats(req.user._id);

			res.status(200).send({ chats });
		} catch (e) {
			console.error(e);
			res.status(500).send();
		}
	}
);

ChatRouter.get(
	`${PREFIX}/:id`,
	auth,
	async (req: Request | any, res: Response) => {
		try {
			const { id } = req.params;
			if (!id) {
				return res.status(400).send();
			}
			const chat = await chatService.getChatFromUser(id, req.user._id);

			if (!chat) {
				return res.status(404).send();
			}

			res.status(200).send({ chat });
		} catch (e) {
			console.error(e);
			res.status(500).send();
		}
	}
);

ChatRouter.post(
	`${PREFIX}`,
	auth,
	async (req: Request | any, res: Response) => {
		try {
			const {
				userIds,
				message,
			}: {
				userIds: string[];
				message?: string;
			} = req.body;
			if (!userIds || !userIds.length) {
				throw new Error();
			}
			const owner = req.user.id;
			const chatMessage = message ? { message, owner } : undefined;
			userIds.unshift(owner);
			const chat = await chatService.createOrReturnChat(userIds, chatMessage);
			res.status(201).send(chat);
		} catch (e) {
			console.error(e);
			res.status(400).send();
		}
	}
);

ChatRouter.put(
	`${PREFIX}`,
	auth,
	async (req: Request | any, res: Response) => {
		try {
			const { message, chatId, inResponseTo } = req.body;
			const owner = req.user.id;
			const chatMessage: IChatMessage = { message, owner, inResponseTo };
			const chat = await chatService.respondToChat(chatId, chatMessage);
			if (chat === null) {
				throw new Error();
			}
			return res.status(200).send(chat);
		} catch (e) {
			res.status(400).send();
		}
	}
);

export default ChatRouter;
