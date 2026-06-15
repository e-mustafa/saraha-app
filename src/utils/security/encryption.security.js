import crypto from 'node:crypto';
import { configEnv } from '../../config/env.js';

const ENCRYPTION_SECRET_KEY = Buffer.from(configEnv.security.encKey, 'hex');
const IV_LENGTH = configEnv.security.iv;

export const encrypt = async (text) => {
	const iv = crypto.randomBytes(IV_LENGTH);
	const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);

	let encryptedText = cipher.update(text, 'utf8', 'hex');
	encryptedText += cipher.final('hex');
	return `${iv.toString('hex')}:${encryptedText}`;
};

export const decrypt = async (encryptedText = '') => {
	const [iv, encryptedText] = encryptedText.split(':');

	const binaryLikeIv = Buffer.from(iv, 'hex');

	const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLikeIv);

	let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
	decryptedText += decipher.final('utf8');
	return decryptedText;
};
