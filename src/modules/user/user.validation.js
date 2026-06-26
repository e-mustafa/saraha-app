import joi from 'joi';
import { attributesSchema } from '../../utils/validation/attributes.validation.js';

export const deleteImageSchema = {
	body: joi.object({
		image: joi.string().required().messages({
			'any.required': 'Image path is required',
		}),
	}),
};

export const avatarUserSchema = {
	file: joi.object({
		avatar: joi.string().required().messages({
			'any.required': 'Avatar is required',
		}),
	}),
};

