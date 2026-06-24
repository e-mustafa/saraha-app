import joi from 'joi';
import { GENDERS, USER_ROLES } from '../../utils/enums/user.enum.js';

export const registerSchema = {
	body: joi.object({
		firstName: joi.string().min(2).max(30).required().messages({
			'string.min': 'First name must be at least 2 characters',
			'string.max': 'First name must be at most 30 characters',
			'any.required': 'First name is required',
		}),

		lastName: joi.string().min(2).max(30).required().messages({
			'string.min': 'Last name must be at least 2 characters',
			'string.max': 'Last name must be at most 30 characters',
			'any.required': 'Last name is required',
		}),

		username: joi.string().min(6).max(30).required().messages({
			'string.min': 'Username must be at least 6 characters',
			'string.max': 'Username must be at most 30 characters',
			'any.required': 'Username is required',
		}),

		email: joi.string().email().trim().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),

		password: joi.string().min(6).required().messages({
			'string.min': 'Password must be at least 6 characters',
			'any.required': 'Password is required',
		}),

		confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
			'any.only': 'Passwords do not match',
			'any.required': 'Confirm password is required',
		}),

		// phone: joi
		// 	.string()
		// 	.pattern(/^01[0125][0-9]{8}$/)
		// 	.required()
		// 	.messages({
		// 		'string.pattern.base': 'Please provide a valid Egyptian phone number',
		// 		'any.required': 'Phone number is required',
		// 	}),

		// gender: joi
		// 	.number()
		// 	.valid(...GENDERS)
		// 	.required()
		// 	.messages({
		// 		'any.only': 'Invalid gender selection',
		// 		'any.required': 'Gender is required',
		// 	}),

		// birthdate: joi.string().required().messages({
		// 	'any.required': 'Birthdate is required',
		// }),

		// avatar: joi.string().uri().optional().messages({
		// 	'string.uri': 'Avatar must be a valid URL',
		// }),

		description: joi.string().optional(),

		role: joi
			.string()
			.valid(...USER_ROLES)
			.messages({
				'any.only': 'Invalid user role',
			}),
	}),

	// params: joi.object({
	// 	id: joi.string().required(),
	// }),
	// query: joi.object({
	// 	page: joi.number().integer().min(1).default(1),
	// 	limit: joi.number().integer().min(1).max(100).default(10),
	// }),
};

export const loginSchema = {
	body: joi.object({
		email: joi.string().email().trim().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),

		password: joi.string().min(6).required().messages({
			'string.min': 'Password must be at least 6 characters',
			'any.required': 'Password is required',
		}),
		rememberMe: joi.boolean().optional(),
	}),
};

export const verifyAccountSchema = {
	body: joi.object({
		email: joi.string().email().trim().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),

		otp: joi.string().length(6).required().messages({
			'string.length': 'OTP must be 6 characters',
			'any.required': 'OTP is required',
		}),
	}),
};

export const resendOtpSchema = {
	body: joi.object({
		email: joi.string().email().trim().required().messages({
			'string.email': 'Please provide a valid email address',
			'any.required': 'Email is required',
		}),
	}),
};