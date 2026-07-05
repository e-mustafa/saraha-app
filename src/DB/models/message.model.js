import { Schema, model } from 'mongoose';
import { appConfig } from '../../config/app.config.js';

const maxLength = appConfig.messages.maxMessageLength;

const messageSchema = new Schema(
	{
		content: {
			type: String,
			required: [true, 'Message content is required'],
			minlength: [5, 'Message content must be at least 5 character'],
			maxlength: [maxLength, `Message content must be less than ${maxLength} characters`],
		},

		attachments: [
			{
				url: String,
				fileType: String,
			},
		],

		to: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			required: [true, 'Message must have a receiver'],
		},

		// extra ----------------------------------------------------------
		from: {
			type: Schema.Types.ObjectId,
			ref: 'user',
			// required: [true, 'Message must have a sender'],
		},

		// extra fields for message
		isAnonymous: {
			// Messages are sent without revealing sender's identity
			type: Boolean,
			default: true,
		},
		isConfidential: {
			// Messages are encrypted and only visible to sender and receiver
			type: Boolean,
			default: true,
		},

		isFavorite: {
			type: Boolean,
		},

		// readAt: Date,
		// deletedAt: Date,
		// expiresAt: Date,
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

// indexes for better query performance - Covered Query instead Collection Scan (COLLSCAN)
messageSchema.index({ to: 1, createdAt: -1 });
messageSchema.index({ from: 1, createdAt: -1 });
messageSchema.index({ to: 1, isFavorite: 1, createdAt: -1 });

// messageSchema.pre('save', function (next) {
// 	if (this.isModified('content') && this.isConfidential) {
// 		this.content = encrypt(this.content);
// 	}
// 	next();
// });

// messageSchema.set('toJSON', {
// 	virtuals: true,
// 	transform: function (doc, data) {
// 		// remove from (sender) data if message is anonymous
// 		if (data.isAnonymous) {
// 			data.from = null;
// 		}

// 		// decrypt content if message is confidential
// 		if (data.isConfidential) {
// 			// data.content = '🔒 This message is confidential';
// 			data.content = decrypt(data.content);
// 		}

// 		if (data.attachments && data.attachments?.length > 0) {
// 			data.attachments = data.attachments.map((attachment) => {
// 				return {
// 					url: `${configEnv.appUrl}/${attachment.url.replace(/\\/g, '/')}`,
// 					fileType: attachment.fileType,
// 				};
// 			});
// 		}

// 		// return data;

// 		return {
// 			id: data._id,
// 			content: data.content,
// 			attachments: data.attachments,
// 			createdAt: data.createdAt,
// 			isFavorite: data.isFavorite,
// 			from: data.isAnonymous ? null : data.from,
// 			to: data.to ? data.to : null,
// 		};
// 	},
// });

const Message = model('Message', messageSchema);
export default Message;
