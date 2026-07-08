import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { configEnv } from '../../config/env.js';

const algorithm = 'aes-256-cbc';

const ENCRYPTION_SECRET_KEY = Buffer.from(configEnv.security.encKey, 'hex');
const IV_LENGTH = +configEnv.security.iv;

/**
 * Encrypts a string using AES-256-CBC
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text in the format "iv:encryptedText"
 */
export const encrypt = (text) => {
	try {
		if (!text) return text;

		const iv = randomBytes(IV_LENGTH);
		const cipher = createCipheriv(algorithm, ENCRYPTION_SECRET_KEY, iv);

		let encryptedText = cipher.update(text, 'utf8', 'hex');
		encryptedText += cipher.final('hex');
		// return `${iv.toString('hex')}:${encryptedText}`;
		// add prefix to identify encrypted data
		return `enc:${iv.toString('hex')}:${encryptedText}`;
	} catch (error) {
		console.error('Error encrypting text:', error);
		return text;
	}
};

/**
 * Decrypts a string using AES-256-CBC
 * @param {string} encryptedData - The encrypted data in the format "iv:encryptedText"
 * @returns {string} - The decrypted text
 */
export const decrypt = (encryptedData = '') => {
	try {
		if (!encryptedData.startsWith('enc:')) {
			return encryptedData;
		}
		const [_, iv, encryptedText] = encryptedData.split(':');

		const binaryLikeIv = Buffer.from(iv, 'hex');

		const decipher = createDecipheriv(algorithm, ENCRYPTION_SECRET_KEY, binaryLikeIv);

		let decryptedText = decipher.update(encryptedText, 'hex', 'utf8');
		decryptedText += decipher.final('utf8');
		return decryptedText;
	} catch (error) {
		console.error('Error decrypting text:', error);
		return encryptedData;
	}
};
