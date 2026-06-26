import { throwInternalException } from "../response/throw.exceptions.js";

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
