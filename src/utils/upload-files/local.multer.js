import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import AppError from '../error-handler/app-error.js';
import { deleteFileHelper } from '../general/file.util.js';
import { createException } from '../response/throw.exceptions.js';
import { fileTypes, friendlyExtensions, mimeTypes } from './mime-types.js';
import verifyFileSignatures from './verify-file-signatures.js';

export const localUpload = ({ dir = 'general', type = fileTypes.images, size = 2 * 1024 * 1024 } = {}) => {
	const basePathname = `uploads/${dir}/`;

	// 1. Setup shared Storage Engine
	const storage = multer.diskStorage({
		destination: async (req, _file, cb) => {
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

	// 2. Setup shared fast File Filter (MIME claims validation from browser)
	const fileFilter = (req, file, cb) => {
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

	// 💡 Smart wrapper function to catch, format, and clear bad file interactions atomically
	const runMiddleware = (multerInstance, maxCount = 1) => {
		return (req, res, next) => {
			multerInstance(req, res, async (err) => {
				if (err) {
					if (err instanceof multer.MulterError) {
						let message = `File upload error: ${err.message}`;

						if (err.code === 'LIMIT_FILE_SIZE') {
							const sizeInMB = (size / (1024 * 1024)).toFixed(1).replace('.0', '');
							message = `File size too large. Maximum allowed size is ${sizeInMB}MB.`;
							return next(new AppError({ statusCode: 400, message, context: 'multer_limit_file_size' }));
						}

						if (err.code === 'LIMIT_UNEXPECTED_FILE') {
							message =
								maxCount === 1
									? 'Only 1 file is allowed to be uploaded.'
									: `Too many files uploaded. Maximum limit allowed is ${maxCount} files.`;
							return next(createException(400, message, 'multer_limit_file_count'));
						}

						return next(createException(400, message, `multer_${err.code}`));
					}

					return next(err);
				}

				// ==========================================
				// 🔒 Deep MIME Type Signature Verification Layer
				// ==========================================
				const uploadedFiles = req.file ? [req.file] : req.files || [];

				try {
					const allowedList = mimeTypes[type];

					// Deeply validates real binary signatures of uploaded files against allowed MIME types.
					await verifyFileSignatures(uploadedFiles, allowedList, type);

					next();
				} catch (sigError) {
					// Atomic Transaction Cleanup: Purge ALL uploaded files in this request if ANY validation fails or crashes
					const allPathsToPurge = uploadedFiles.map((f) => f.path);
					await deleteFileHelper(allPathsToPurge, true);

					// Propagate validation errors gracefully, wrap native crashes into 500 exceptions
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

	// 3. Return object interfaces for endpoint route implementation
	return {
		single: (fieldname) => {
			const upload = multer({ storage, fileFilter, limits: { fileSize: size } });
			return runMiddleware(upload.single(fieldname), 1);
		},
		array: (fieldname, maxCount) => {
			const upload = multer({ storage, fileFilter, limits: { fileSize: size, files: maxCount } });
			return runMiddleware(upload.array(fieldname, maxCount), maxCount);
		},
	};
};
