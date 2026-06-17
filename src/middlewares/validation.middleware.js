import { throwException } from '../utils/response/throw.exceptions.js';

const validation = (schema, req) => {
	return (req, res, next) => {
		if (!schema || !req) throw new Error('Schema and req are required to validate data.');
		const existSchemas = Object.keys(schema);
		const ValidationErrors = {};

		existSchemas.forEach((key) => {
			const schemaRes = schema[key]?.validate(req?.[key] || {}, { abortEarly: false });
			if (schemaRes?.error) {
				const errors = {};
				schemaRes.error.details.forEach((error) => {
					errors[error.path[0]] = error.message;
				});
				ValidationErrors[key] = errors;
			}
		});
		if (Object.keys(ValidationErrors).length > 0) {
			throwException(400, 'Validation Error', 'ValidationError', ValidationErrors);
		}
		next();
	};
};
export default validation;
