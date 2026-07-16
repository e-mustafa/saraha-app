import joi from 'joi';
import { generalFields, uploadFileSchema } from '../../utils/validation/general-fields.validation.js';

export const deleteImageSchema = {
	body: joi.object({
		id: generalFields.public_id,
	}),
};

export const avatarUserSchema = {
	body: joi.object({
		avatar: uploadFileSchema.messages({
			'any.required': 'avatar image is required',
			'object.base': 'Please upload a valid avatar image file', // Custom message when avatar is not a valid file object
		}),
	}),
};

export const coverUserSchema = {
	body: joi.object({
		covers: joi.array().items(uploadFileSchema).min(1).required().messages({
			'any.required': 'cover image is required',
			'array.min': 'cover image is required',
			'object.base': 'Please upload a valid cover image file', // Custom message when cover is not a valid file object
		}),
	}),
};

export const replaceCoverUserSchema = {
	body: joi.object({
		id: generalFields.public_id,
		// Covers is now naturally validated as a field inside the body payload
		cover: uploadFileSchema.messages({
			'any.required': 'cover image is required',
			'object.base': 'Please upload a valid cover image file', // Custom message when cover is not a valid file object
		}),
	}),
};

export const visitUserSchema = {
	params: joi.object({
		username: generalFields.username,
	}),
};
