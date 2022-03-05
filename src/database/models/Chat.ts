import { Document, model, Model, Schema } from "mongoose";

export interface IChatMessage {
	_id?: any;
	message: string;
	owner: any;
	inResponseTo?: any;
	createdAt?: Date;
}
export interface IChat {
	_id?: any;
	users: { type: Schema.Types.ObjectId }[];
	messages: IChatMessage[];
}

const chatMessageSchema = new Schema<IChatMessage>({
	message: {
		type: String,
		required: true,
	},
	owner: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

chatMessageSchema.virtual("user", {
	ref: "User",
	localField: "owner",
	foreignField: "_id",
	justOne: true,
});

export interface IChatDocument extends IChat, Document {}

interface IChatModel extends Model<IChatDocument> {}

const chatSchema = new Schema<IChatDocument>(
	{
		users: [
			{
				type: Schema.Types.ObjectId,
				required: true,
				ref: "User",
			},
		],
		messages: {
			type: [chatMessageSchema],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
	}
);

export const Chat = model<IChatDocument, IChatModel>("Chat", chatSchema);
