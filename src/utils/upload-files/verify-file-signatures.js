import { fileTypeFromFile } from 'file-type';
import path from 'node:path';
import { createException } from '../response/throw.exceptions.js';
import { fileTypes } from './mime-types.js';

/**
 * @param {Array} files - Array of files to verify
 * @param {Array} allowedList - Array of allowed MIME types
 * @param {string} categoryType - Category type (e.g., 'docs', 'images')
 * @returns {Promise<void>}
 */
const verifyFileSignatures = async (files, allowedList, categoryType) => {
	for (const file of files) {
		const actualMeta = await fileTypeFromFile(file.path);

		// Handle raw text files (.txt) which naturally lack binary magic numbers
		if (!actualMeta) {
			const fileExt = path.extname(file.originalname).toLowerCase();
			if (categoryType === fileTypes.docs && fileExt === '.txt' && file.mimetype === 'text/plain') {
				continue;
			}

			// Block corrupted files or unknown executable code disguised without headers
			throw createException(
				400,
				`Security Alert: Corrupted or invalid file signature for "${file.originalname}".`,
				'invalid_file_signature',
			);
		}

		// Block file extension spoofing attacks (e.g., hacker.exe renamed to avatar.png)
		if (!allowedList.includes(actualMeta.mime)) {
			throw createException(
				400,
				`Security Alert: Fake file detected! The actual content of "${file.originalname}" does not match its extension.`,
				'file_signature_spoofing',
			);
		}
	}
};
export default verifyFileSignatures;
