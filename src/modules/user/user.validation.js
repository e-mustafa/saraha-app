import joi from 'joi';

export const deleteImageSchema = {
	body: joi.object({
		image: joi.string().required().messages({
			'any.required': 'Image path is required',
		}),
	}),
};
