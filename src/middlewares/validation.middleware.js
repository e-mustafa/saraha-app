import {
	BadRequestException,
	throwInternalException,
	ValidationFieldsException,
} from '../utils/response/throw.exceptions.js';
import { validateFields } from '../utils/validation/validate-fields.validation.js';

const validation = (schema) => {
	return (req, res, next) => {
		if (!schema || !req) throwInternalException('Schema and req are required to validate data.');
		const existSchemas = Object.keys(schema);
		const ValidationErrors = {};

		existSchemas.forEach((key) => {
			if (!req[key]) {
				BadRequestException(`Missing data in ${key}, please provide required data.`);
			}
			const result = validateFields(schema[key], req[key]);
			if (!result.success) {
				ValidationErrors[key] = result.errors;
			} else {
				req[key] = result.values; // Overwrite req with sanitized and casted data
			}
		});

		if (Object.keys(ValidationErrors).length > 0) {
			ValidationFieldsException(ValidationErrors);
		}
		next();
	};
};
export default validation;
