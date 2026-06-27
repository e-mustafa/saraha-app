import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import AppError from '../error-handler/app-error.js';

const allowedMimeTypes = {
	images: [
		'image/apng',
		'image/avif',
		'image/gif',
		'image/jpeg',
		'image/png',
		'image/svg+xml',
		'image/webp',
		'image/bmp',
		'image/tiff',
	],
	videos: [
		'video/mp4',
		'video/webm',
		'video/ogg',
		'video/quicktime',
		'video/x-msvideo',
		'video/x-flv',
		'video/x-matroska',
		'video/3gpp',
		'video/3gpp2',
		'video/mpeg',
		'application/x-mpegURL',
	],
	docs: [
		'application/pdf',
		'application/msword', // .doc
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
		'application/vnd.ms-excel', // .xls
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
		'application/vnd.ms-powerpoint', // .ppt
		'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
		'text/plain', // .txt
		'application/rtf', // .rtf
		'application/vnd.oasis.opendocument.text', // .odt
		'application/vnd.oasis.opendocument.spreadsheet', // .ods
		'application/vnd.oasis.opendocument.presentation', // .odp
	],
};

const friendlyExtensions = {
	images: 'JPG, PNG, WebP, SVG, GIF, AVIF',
	videos: 'MP4, WebM, MOV, MKV, AVI',
	docs: 'PDF, DOC, DOCX, XLS, XLSX, TXT',
	media: 'Images or Videos (MP4, JPG, PNG, etc.)',
	all: 'Images, Videos, or Documents (PDF, DOCX, etc.)',
};

const mimeTypes = {
	images: allowedMimeTypes.images,
	videos: allowedMimeTypes.videos,
	docs: allowedMimeTypes.docs,
	media: [...allowedMimeTypes.images, ...allowedMimeTypes.videos],
	all: [...allowedMimeTypes.images, ...allowedMimeTypes.videos, ...allowedMimeTypes.docs],
};

export const fileTypes = {
	images: 'images',
	videos: 'videos',
	docs: 'docs',
	media: 'media',
	all: 'all',
};

export const localUpload = ({ dir = 'general', type = fileTypes.images, size = 2 * 1024 * 1024 } = {}) => {
	const basePathname = `uploads/${dir}/`;

	const storage = multer.diskStorage({
		destination: async (req, _file, cb) => {
			let userBasePath = basePathname;
			if (req?.user?._id) userBasePath += `${req.user._id}/`;

			// use path.resolve to get the full path from project root
			const fullPathname = path.resolve(process.cwd(), 'src', userBasePath);

			// if (!fs.existsSync(fullPathname)) {
			// 	fs.mkdirSync(fullPathname, { recursive: true });
			// }
			try {
				await fs.mkdir(fullPathname, { recursive: true });

				cb(null, fullPathname);
			} catch (err) {
				cb(err);
			}

			// cb(null, fullPathname);
		},

		filename: (req, file, cb) => {
			// get file extension
			const fileExt = path.extname(file.originalname);
			const uniqueFilename = `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

			let userBasePath = basePathname;
			if (req?.user?._id) userBasePath += `${req.user._id}/`;

			// this will be used in the controller to access the file
			file.filePath = `${userBasePath}${uniqueFilename}`;

			cb(null, uniqueFilename);
		},
	});

	const fileFilter = (req, file, cb) => {
		// check if the type is valid
		const allowedList = mimeTypes[type];

		if (!allowedList) {
			return cb(
				new AppError({
					statusCode: 500,
					message: `Developer Error: Invalid file type category: ${type}`,
					context: 'Multer File Type Filter Setup',
					isOperational: false,
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
					message: `Invalid file format! Allowed formats for this field are: ${friendlyExtensions[type]}`,
					context: 'Multer_User_File_Type_Verification',
				}),
				false,
			);
		}
	};

	return multer({ fileFilter, limits: { fileSize: size }, storage });
};
