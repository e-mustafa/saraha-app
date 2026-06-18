import { throwInternalException, ValidationFieldsException } from '../utils/response/throw.exceptions.js';

export const validateFields = (schema, data) => {
	if (!schema || !data) throwInternalException('Schema and data are required to validate data.');

	const schemaRes = schema?.validate(data || {}, { abortEarly: false });
	if (schemaRes?.error) {
		const errors = {};
		schemaRes.error.details.forEach((error) => {
			const key = error.path.join('.');
			errors[key] = error.message;
		});
		return { success: false, errors };
	}
	return { success: true, values: schemaRes.value };
};

const validation = (schema) => {
	return (req, res, next) => {
		if (!schema || !req) throwInternalException('Schema and req are required to validate data.');
		const existSchemas = Object.keys(schema);
		const ValidationErrors = {};

		existSchemas.forEach((key) => {
			const result = validateFields(schema[key], req[key]);
			if (!result.success) {
				ValidationErrors[key] = result.errors;
			} else {
				req[key] = result.values; // Overwrite req with sanitized and casted data
			}
		});
		
		if (Object.keys(ValidationErrors).length > 0) {
			ValidationFieldsException(ValidationErrors, 'Validation Error');
		}
		next();
	};
};
export default validation;
