import joi from 'joi';
import { isValidObjectId } from 'mongoose';
import { GENDERS, USER_ROLES } from '../enums/user.enum.js';

// Custom validator to check for valid Mongoose ObjectId
const isObjectId = (value, helpers) => {
	if (!isValidObjectId(value)) {
		return helpers.message('Invalid ID format');
	}
	return value;
};

// Regex for strong password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Regex for Egyptian phone number: 01[0125][0-9]{8} -> 01012345678
const phoneRegex = /^01[0125][0-9]{8}$/;

const otpRegex = /^\d{6}$/;

export const generalFields = {
	id: joi.string().required().custom(isObjectId).messages({
		'any.required': 'ID is required',
	}),

	firstName: joi.string().trim().min(2).max(30).required().messages({
		'string.min': 'First name must be at least 2 characters',
		'string.max': 'First name must be at most 30 characters',
		'any.required': 'First name is required',
	}),

	lastName: joi.string().trim().min(2).max(30).required().messages({
		'string.min': 'Last name must be at least 2 characters',
		'string.max': 'Last name must be at most 30 characters',
		'any.required': 'Last name is required',
	}),

	username: joi.string().trim().min(6).max(30).required().messages({
		'string.min': 'Username must be at least 6 characters',
		'string.max': 'Username must be at most 30 characters',
		'any.required': 'Username is required',
	}),

	email: joi.string().email().trim().lowercase().required().messages({
		'string.email': 'Please provide a valid email address',
		'any.required': 'Email is required',
	}),

	password: joi.string().pattern(strongPasswordRegex).required().messages({
		'string.pattern.base':
			'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
		'any.required': 'Password is required',
	}),

	confirmPassword: joi.string().valid(joi.ref('password')).required().messages({
		'any.only': 'Passwords do not match',
		'any.required': 'Confirm password is required',
	}),

	phone: joi.string().pattern(phoneRegex).required().messages({
		'any.required': 'Phone number is required',
		'string.pattern.base': 'Please provide a valid Egyptian phone number',
	}),

	gender: joi
		.number()
		.valid(...GENDERS)
		.required()
		.messages({
			'any.only': 'Invalid gender selection',
			'any.required': 'Gender is required',
		}),

	// Accepts valid date strings like '2001-10-20' and converts them to Date object
	birthdate: joi.date().required().messages({
		'date.base': 'Please provide a valid date',
		'any.required': 'Birthdate is required',
	}),

	// Kept as string to support both absolute URLs (CDNs) and local server relative paths
	avatar: joi.string().max(2048).optional().messages({
		'string.max': 'avatar path is too long',
	}),

	bio: joi.string().max(500).optional(),

	role: joi
		.string()
		.valid(...USER_ROLES)
		.messages({
			'any.only': 'Invalid user role',
		}),

	// otp: joi.string().pattern(otpRegex).required().messages({
	otp: joi.string().length(6).required().messages({
		'string.length': 'OTP must be 6 characters',
		'any.required': 'OTP is required',
	}),
	token: joi.string().required().messages({
		'string.required': 'Token is required',
	}),
};
