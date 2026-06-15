import { Schema, model } from 'mongoose';

const messageSchema = new Schema({
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
});

const Message = model('Message', messageSchema);
export default Message;
