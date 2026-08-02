import joi from 'joi';
import { appConfig } from '../../config/app.config.js';
import { generalFields, uploadFileSchema } from '../../utils/validation/general-fields.validation.js';

const maxContentLength = appConfig.messages.maxMessageLength;

export const sendMessageSchema = {
	params: joi.object({
		id: generalFields.id,
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
		isPublic: joi.boolean().optional().default(false),
		isAnonymous: joi.boolean().optional().default(false),
		saveToMyMessages: joi.boolean().optional().default(false),

		attachments: joi
			.array()
			.items(uploadFileSchema)
			.max(appConfig.messages.maxAttachmentsPerMessage)
			.optional()
			.messages({
				'array.max': `You can upload a maximum of ${appConfig.messages.maxAttachmentsPerMessage} files`,
				'object.base': 'Please upload a valid cover image file', // Custom message when cover is not a valid file object
			}),
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

export const getPublicMessageSchema = {
	params: joi.object({
		username: generalFields.username,
	}),
};

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

export const toggleMessageSchema = {
	params: joi.object({
		id: generalFields.id,
	}),
};
