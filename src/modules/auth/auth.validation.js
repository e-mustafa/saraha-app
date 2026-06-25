import joi from 'joi';
import { attributesSchema } from '../../utils/validation/attributes.validation.js';

export const objectIdSchema = {
	params: joi.object({
		id: attributesSchema.id,
	}),
};

export const registerSchema = {
	body: joi.object({
		firstName: attributesSchema.firstName,
		lastName: attributesSchema.lastName,
		username: attributesSchema.username,
		email: attributesSchema.email,
		password: attributesSchema.password,
		confirmPassword: attributesSchema.confirmPassword,
	}),

	// params: joi.object({
	// 	id: attributesSchema.id,
	// }),
	// query: joi.object({
	// 	page: joi.number().integer().min(1).default(1),
	// 	limit: joi.number().integer().min(1).max(100).default(10),
	// }),
};

export const loginSchema = {
	body: joi.object({
		email: attributesSchema.email,
		password: attributesSchema.password,
		rememberMe: joi.boolean().optional(),
	}),
};

export const verifyAccountSchema = {
	body: joi.object({
		email: attributesSchema.email,
		otp: attributesSchema.otp,
	}),
};

export const resendOtpSchema = {
	body: joi.object({
		email: attributesSchema.email,
	}),
};
