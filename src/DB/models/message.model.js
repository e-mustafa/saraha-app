import { Schema, model } from 'mongoose';

const messageSchema = new Schema(
	{
		content: {
			type: String,
			required: [true, 'Message content is required'],
		},

		image: String,

		from: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Message must have a sender'],
		},
		to: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Message must have a receiver'],
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		strict: true,
		strictQuery: true,
		optimisticConcurrency: true,
	},
);

const Message = model('Message', messageSchema);
export default Message;
