import { Schema, model } from 'mongoose';
import { appConfig } from '../../config/app.config.js';

const maxLength = appConfig.messages.maxMessageLength;
const maxAttachments = appConfig.messages.maxAttachmentsPerMessage;

const messageSchema = new Schema(
	{
		content: {
			type: String,
			required: [true, 'Message content is required'],
			minlength: [5, 'Message content must be at least 5 character'],
			maxlength: [maxLength, `Message content must be less than ${maxLength} characters`],
		},

		attachments: {
			type: [
				{
					id: String,
					url: String,
					fileType: String,
					_id: false,
				},
			],
			validate: {
				validator: function (value) {
					return value.length <= maxAttachments;
				},
				message: `Attachments must be at most ${maxAttachments} files`,
			},
			_id: false,
		},

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
		// isConfidential: {

		// 	type: Boolean,
		// 	default: true,
		// },
		isPublic: {
			// Messages are not encrypted and only visible to sender and receiver
			type: Boolean,
			default: false,
		},

		toFavorite: Boolean,
		fromFavorite: Boolean,

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
messageSchema.index({ to: 1, toFavorite: 1, createdAt: -1 });
messageSchema.index({ from: 1, fromFavorite: 1, createdAt: -1 });
messageSchema.index({ to: 1, isPublic: 1, createdAt: -1 });

const Message = model('message', messageSchema);
export default Message;
