import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * @param {string | string[]} filesPath - Path(s) to the file(s) to delete
 * @param {boolean} isAbsolute - Whether the path is absolute or relative
 * @returns {Promise<void>}
 */
export const deleteFileHelper = async (filesPath, isAbsolute = false) => {
	if (!filesPath) return;

	const files = typeof filesPath === 'string' ? [filesPath] : filesPath;

	for (const file of files) {
		try {
			const fullPath = isAbsolute ? file : path.resolve(process.cwd(), 'src', file);
			await fs.unlink(fullPath);
			console.log(`Successfully deleted file: ${file}`);
		} catch (error) {
			if (error.code === 'ENOENT') {
				console.warn(`File already deleted or not found: ${file}`);
			} else {
				console.error(`Couldn't delete file: ${file}`, error);
				// TODO: add logging service
			}
		}
	}
};
