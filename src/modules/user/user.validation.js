import joi from 'joi';
import { generalFields } from '../../utils/validation/general-fields.validation.js';

export const deleteImageSchema = {
	body: joi.object({
		image: joi.string().required().messages({
			'any.required': 'Image path is required',
		}),
	}),
};

export const avatarUserSchema = {
	file: joi.object({
		filePath: joi.string().required().messages({
			'any.required': 'avatar is required',
		}),
	}),
};

export const coverUserSchema = {
	files: joi
		.array()
		.items(
			joi
				.object({
					filePath: joi.string().required(),
				})
				.unknown(true), // allow other fields like filename to pass without validation errors
		)
		.min(1)
		.max(2)
		.required()
		.messages({
			'any.required': 'Cover images are required',
			'array.min': 'Please upload at least one cover image',
			'array.max': 'You can upload a maximum of 2 cover images',
		}),
};

export const visitUserSchema = {
	params: joi.object({
		username: generalFields.username,
	}),
};
