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

export const friendlyExtensions = {
	images: 'JPG, PNG, WebP, SVG, GIF, AVIF',
	videos: 'MP4, WebM, MOV, MKV, AVI',
	docs: 'PDF, DOC, DOCX, XLS, XLSX, TXT',
	media: 'Images or Videos (MP4, JPG, PNG, etc.)',
	all: 'Images, Videos, or Documents (PDF, DOCX, etc.)',
};

export const mimeTypes = {
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
