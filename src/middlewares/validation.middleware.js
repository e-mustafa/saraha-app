import { throwInternalException, ValidationFieldsException } from '../utils/response/throw.exceptions.js';
import { validateFields } from '../utils/validation/validate-fields.validation.js';

const validation = (schema) => {
	return (req, res, next) => {
		if (!schema || !req) {
			throwInternalException('Schema and req are required to validate data.');
		}

		// Initialize req.body if it doesn't exist
		if (!req.body) {
			req.body = {};
		}

		// 1. Smart Dynamic Injection: Inject files into req.body based on Multer's behavior
		if (req.file) {
			// Handles upload.single() -> Inject as a single object
			req.body[req.file.fieldname] = req.file;
		} else if (req.files) {
			if (Array.isArray(req.files)) {
				// Handles upload.array() -> Inject as an array under the correct fieldname
				if (req.files.length > 0) {
					const fieldName = req.files[0].fieldname;
					req.body[fieldName] = req.files;
				}
			} else if (typeof req.files === 'object') {
				// Handles upload.fields() -> Inject each field array dynamically
				Object.keys(req.files).forEach((fieldName) => {
					req.body[fieldName] = req.files[fieldName];
				});
			}
		}

		const existSchemas = Object.keys(schema);
		const ValidationErrors = {};

		existSchemas.forEach((key) => {
			if (!req[key]) {
				req[key] = {};
			}

			const result = validateFields(schema[key], req[key]);

			if (!result.success) {
				if (result.errors && typeof result.errors === 'object' && '' in result.errors) {
					ValidationErrors[key] = result.errors[''];
				} else {
					ValidationErrors[key] = result.errors;
				}
			} else {
				req[key] = result.values; // Overwrite with clean and validated data
			}
		});

		if (Object.keys(ValidationErrors).length > 0) {
			ValidationFieldsException(ValidationErrors);
		}
		next();
	};
};

export default validation;
