import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import AppError from '../error-handler/app-error.js';
import { deleteFileHelper } from '../general/file.util.js';
import { createException } from '../response/throw.exceptions.js';
import { fileTypes, friendlyExtensions, mimeTypes } from './mime-types.js';
import verifyFileSignatures from './verify-file-signatures.js';

// ==========================================
// 1. Shared File Filter
// ==========================================
const createFileFilter = (type) => {
	return (req, file, cb) => {
		const allowedList = mimeTypes[type];
		if (!allowedList) {
			return cb(
				new AppError({
					statusCode: 500,
					message: `Developer Error: Invalid file type category provided: ${type}`,
					context: 'Multer File Filter Setup',
				}),
				false,
			);
		}

		if (type === 'all' || allowedList.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new AppError({
					statusCode: 400,
					message: `Invalid file format! Allowed formats: ${friendlyExtensions[type]}`,
					context: 'User File Type Verification',
				}),
				false,
			);
		}
	};
};

// ==========================================
// 2. Shared Middleware Wrapper (Local & Cloud)
// ==========================================
const runMiddleware = ({ multerInstance, maxCount, expectedFieldName, type, size, isLocal }) => {
	return (req, res, next) => {
		multerInstance(req, res, async (err) => {
			console.log('maxCount', maxCount);
			if (err) {
				console.log('err', err);
				if (err instanceof multer.MulterError) {
					let message = `File upload error: ${err.message}`;

					if (err.code === 'LIMIT_FILE_SIZE') {
						const sizeInMB = (size / (1024 * 1024)).toFixed(1).replace('.0', '');
						message = `File size too large. Maximum allowed size is ${sizeInMB}MB.`;
						return next(new AppError({ statusCode: 400, message, context: 'multer_limit_file_size' }));
					}

					if (err.code === 'LIMIT_UNEXPECTED_FILE') {
						const receivedField = err.field;

						if (receivedField && receivedField !== expectedFieldName) {
							message = `Invalid field name '${receivedField}'. Please upload your file(s) using the field name '${expectedFieldName}'.`;
						}

						return next(createException(400, message, 'multer_limit_file_count'));
					}

					if (err.code === 'LIMIT_FILE_COUNT') {
						message =
							maxCount === 1
								? `Only 1 file is allowed to be uploaded under the field '${expectedFieldName}'.`
								: `Too many files uploaded. Maximum limit allowed is ${maxCount} files for field '${expectedFieldName}'.`;
					}

					return next(createException(400, message, `multer_${err.code}`));
				}

				return next(err);
			}

			// 🔒 Deep MIME Type Signature Verification Layer
			const uploadedFiles = req.file ? [req.file] : req.files || [];

			try {
				const allowedList = mimeTypes[type];

				// Validate buffer or file path signatures
				await verifyFileSignatures(uploadedFiles, allowedList, type);

				next();
			} catch (sigError) {
				// Cleanup on local disk if verification fails
				if (isLocal && uploadedFiles.length > 0) {
					const allPathsToPurge = uploadedFiles.map((f) => f.path).filter(Boolean);
					await deleteFileHelper(allPathsToPurge, true);
				}

				if (sigError.isOperational) {
					return next(sigError);
				}

				return next(
					createException(
						500,
						'Internal server error during file security verification.',
						'file_signature_error',
						null,
						true,
						sigError,
					),
				);
			}
		});
	};
};

// ==========================================
// 3. Local Storage Configuration Helper
// ==========================================
const createLocalStorage = (dir) => {
	const basePathname = `uploads/${dir}/`;

	return multer.diskStorage({
		destination: async (req, file, cb) => {
			let userBasePath = basePathname;
			if (req?.user?._id) userBasePath += `${req.user._id}/`;
			const fullPathname = path.resolve(process.cwd(), 'src', userBasePath);
			try {
				await fs.mkdir(fullPathname, { recursive: true });
				cb(null, fullPathname);
			} catch (err) {
				cb(
					new AppError({
						statusCode: 500,
						message: 'Server failed to allocate upload space.',
						context: 'Multer Storage Destination',
						originalError: err,
					}),
				);
			}
		},
		filename: (req, file, cb) => {
			const fileExt = path.extname(file.originalname);
			const uniqueFilename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
			let userBasePath = basePathname;
			if (req?.user?._id) userBasePath += `${req.user._id}/`;
			file.filePath = `${userBasePath}${uniqueFilename}`;
			cb(null, uniqueFilename);
		},
	});
};

// ==========================================
// 4. Main Factory Function
// ==========================================
export const uploadFactory = ({
	storageType = 'cloud', // 'local' or 'cloud'
	dir = 'general', // Only used for 'local'
	type = fileTypes.images,
	size = 2 * 1024 * 1024,
} = {}) => {
	const isLocal = storageType === 'local';

	// Select storage strategy based on parameter
	const storage = isLocal ? createLocalStorage(dir) : multer.memoryStorage();
	const fileFilter = createFileFilter(type);

	return {
		single: (fieldname) => {
			const upload = multer({ storage, fileFilter, limits: { fileSize: size } });
			return runMiddleware({
				multerInstance: upload.single(fieldname),
				maxCount: 1,
				expectedFieldName: fieldname,
				type,
				size,
				isLocal,
			});
		},
		array: (fieldname, maxCount) => {
			const upload = multer({ storage, fileFilter, limits: { fileSize: size, files: maxCount } });
			return runMiddleware({
				multerInstance: upload.array(fieldname, maxCount),
				maxCount,
				expectedFieldName: fieldname,
				type,
				size,
				isLocal,
			});
		},
	};
};

// Aliases for clean imports and backward compatibility
export const uploadLocal = ({ dir, type, size } = {}) => uploadFactory({ storageType: 'local', dir, type, size });

export const uploadCloud = (type, size) => uploadFactory({ storageType: 'cloud', type, size });
