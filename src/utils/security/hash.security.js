import { argon2Hash, verify } from 'argon2';
import { compare, hash } from 'bcrypt';
import { configEnv } from '../../config/env.js';
import { asyncHandler } from '../error-handler/index.js';

export const generalHash = asyncHandler(async ({ text, salt = configEnv.security.salt, isHard = false }) => {
	if (isHard) {
		return await argon2Hash(text);
	} else {
		return await hash(text, salt);
	}
});

export const generalVerify = asyncHandler(async ({ text, hashedText, isHard = false }) => {
	if (isHard) {
		return await verify(hashedText, text);
	} else {
		return await compare(text, hashedText);
	}
});
