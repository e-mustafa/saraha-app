import { hash as argon2Hash, verify } from 'argon2';
import { compare, hash } from 'bcrypt';
import { configEnv } from '../../config/env.js';

export const generateHash = async (text, salt = +configEnv.security.salt, isHard = false) => {
	let hashedText = '';
	if (isHard) {
		hashedText = await argon2Hash(text);
	} else {
		hashedText = await hash(text, salt);
	}
	return hashedText;
};

export const verifyHash = async (text, hashedText, isHard = false) => {
	if (isHard) {
		return await verify(hashedText, text);
	} else {
		return await compare(text, hashedText);
	}
};
