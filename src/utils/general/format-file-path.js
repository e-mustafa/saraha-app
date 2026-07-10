import { configEnv } from '../../config/env.js';

export const formatFilePath = (filePath) => {
	if (filePath) {
		if (filePath.startsWith('http')) return filePath;

		return `${configEnv.appUrl}/${filePath.replace(/\\/g, '/')}`;
	}
	return null;
};
