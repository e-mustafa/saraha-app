import joi from 'joi';
import { generalFields } from '../../utils/validation/general-fields.validation.js';

export const objectIdSchema = {
	params: joi.object({
		id: generalFields.id,
	}),
};

export const checkUsernameSchema = {
	body: joi.object({
		username: generalFields.username,
	}),
};

export const registerSchema = {
	body: joi.object({
		firstName: generalFields.firstName,
		lastName: generalFields.lastName,
		username: generalFields.username,
		email: generalFields.email,
		password: generalFields.password,
		confirmPassword: generalFields.confirmPassword,
	}),

	// params: joi.object({
	// 	id: generalFields.id,
	// }),
	// query: joi.object({
	// 	page: joi.number().integer().min(1).default(1),
	// 	limit: joi.number().integer().min(1).max(100).default(10),
	// }),
};

export const loginSchema = {
	body: joi.object({
		email: generalFields.email,
		password: generalFields.password,
		rememberMe: joi.boolean().optional(),
	}),
};

export const verifyEmailSchema = {
	body: joi.object({
		email: generalFields.email,
		otp: generalFields.otp,
	}),
};

export const resendOtpSchema = {
	body: joi.object({
		email: generalFields.email,
	}),
};

export const refreshTokenSchema = {
	cookies: joi
		.object({
			refreshToken: joi.string().required().messages({
				'string.required': 'Refresh token is required',
			}),
		})
		.unknown(),
};

export const forgetPasswordSchema = {
	body: joi.object({
		email: generalFields.email,
	}),
};

export const resetPasswordSchema = {
	body: joi.object({
		token: joi.string().required().messages({
			'string.required': 'Token is required',
		}),
		password: generalFields.password,
		// confirmPassword: generalFields.confirmPassword,
		logoutAll: joi.boolean().optional(),
	}),
};

export const changePasswordSchema = {
	body: joi.object({
		oldPassword: generalFields.password,
		newPassword: generalFields.password.invalid(joi.ref('oldPassword')).messages({
			'any.invalid': 'New password must be different from old password',
		}),
		isConfirmed: joi.boolean().required().messages({
			'boolean.required': 'isConfirmed is required',
		}),
		// confirmPassword: generalFields.confirmPassword,
		logoutAll: joi.boolean().optional(),
	}),
};

export const changeEmailRequestSchema = {
	body: joi.object({
		newEmail: generalFields.email,
		password: generalFields.password,
	}),
};

export const changeEmailSchema = {
	body: joi.object({
		otp: generalFields.otp,
	}),
};

export const revertEmailSchema = {
	body: joi.object({
		token: generalFields,
	}),
};
