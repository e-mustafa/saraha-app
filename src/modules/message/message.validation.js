import joi from 'joi';
import { appConfig } from '../../config/app.config.js';
import { generalFields } from '../../utils/validation/general-fields.validation.js';

const maxContentLength = appConfig.messages.maxMessageLength;

export const sendMessageSchema = {
	params: joi.object({
		username: generalFields.username,
	}),

	body: joi.object({
		content: joi
			.string()
			.required()
			.min(5)
			.max(maxContentLength)
			.messages({
				'any.required': 'Message content is required',
				'string.min': 'Message content must be at least 5 characters',
				'string.max': `Message content must be less than ${maxContentLength} characters`,
			}),
		from: joi.string().optional(),
		// attachments: joi.array().items(joi.string()).optional(),
		isConfidential: joi.boolean().optional().default(false),
		isAnonymous: joi.boolean().optional().default(false),
		saveToMyMessages: joi.boolean().optional().default(false),
	}),

	files: joi
		.array()
		.items(
			joi
				.object({
					filePath: joi.string().required(),
					mimetype: joi.string().required(),
				})
				.unknown(true), // allow other fields like filename to pass without validation errors
		)
		.max(appConfig.messages.maxAttachmentsPerMessage)
		.optional()
		.default([])
		.messages({
			'any.required': 'Files are required',
			'array.min': 'Please upload at least one file',
			'array.max': `You can upload a maximum of ${appConfig.messages.maxAttachmentsPerMessage} files`,
		}),
};

// export const getMessagesTypeSchema = {
// 	query: joi.object({
// 		page: joi.number().optional(),
// 		limit: joi.number().optional(),
// 		content: joi.string().optional(),
// 		sortBy: joi.string().optional(),
// 	}),
// };

export const getMessageSchema = {
	params: joi.object({
		id: generalFields.id,
	}),
};

export const deleteMessageSchema = {
	params: joi.object({
		id: generalFields.id,
	}),
};
