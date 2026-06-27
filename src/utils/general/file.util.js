import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

export const moveFileHelper = async (oldPath, newDir) => {
	if (!oldPath || !newDir) {
		throw new Error('Missing required parameters: oldPath, newDir');
	}

	try {
		const newDirPath = Array.isArray(newDir) ? newDir : [newDir];

		// 1. get file name
		const fileName = path.basename(oldPath);

		// 2. get absolute path
		const oldFullPath = path.resolve('src', oldPath);

		// 3. check if file exists on disk to avoid crash
		try {
			await fs.access(oldFullPath);
		} catch {
			console.warn(`⚠️ File not found on disk, skipping move: ${oldFullPath}`);
			return null; // نرجع null لكي نعرف في الـ Controller أن الملف لم ينقل لأنه غير موجود
		}

		// 4. get target directory
		const targetDir = path.resolve('src', ...newDirPath);

		// 5. get new full path
		const newFullPath = path.join(targetDir, fileName);

		// 6. create directory if not exists
		await fs.mkdir(targetDir, { recursive: true });

		// 7. copy and delete safely
		await fs.copyFile(oldFullPath, newFullPath);
		await fs.unlink(oldFullPath);

		console.log(`✅ File moved successfully to: ${newFullPath}`);

		// 8. Return relative path with unified slashes (/) for web links
		const relativePath = path.join(...newDirPath, fileName);
		return relativePath.replace(/\\/g, '/');
	} catch (error) {
		console.error('❌ Failed to move file in helper:', error);
		throw error;
	}
};
