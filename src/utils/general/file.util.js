import fs from 'node:fs/promises';
import path from 'node:path';

export const deleteFileHelper = async (relativeFilePath) => {
	if (!relativeFilePath) return;
	try {
		const fullPath = path.resolve(process.cwd(), 'src', relativeFilePath);
		// check if file exists to avoid crash
		await fs.access(fullPath);
		await fs.unlink(fullPath);
		console.log(`Successfully deleted old file: ${relativeFilePath}`);
	} catch (error) {
		// if file not found, log warning
		console.warn(`File not found or couldn't be deleted: ${relativeFilePath}`, error);
		// TODO: add logging service
	}
};
