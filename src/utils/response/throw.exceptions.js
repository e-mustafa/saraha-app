import { AppError } from '../error-handler/index.js';

export const throwException = (status = 500, message = 'Sorry, Something went wrong.', context, errors, originalError) => {
	throw new AppError(status, message, context, errors, originalError);
};
