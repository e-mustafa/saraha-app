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
	audios: [
		// 2. Audio & Voice Recordings
		'audio/mpeg', // Standard .mp3 files
		'audio/wav', // Uncompressed .wav files
		'audio/x-wav', // Fallback for some wav encoders
		'audio/webm', // Crucial: Default format for browser voice recorders (MediaRecorder API)
		'audio/ogg', // Open audio format .ogg
		'audio/aac', // Advanced Audio Coding .aac
		'audio/x-m4a', // Apple voice memos .m4a
		'audio/m4a', // Alternative .m4a mime type
		'audio/3gpp', // Legacy mobile recordings .3gp
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
	audio: 'MP3, M4A, mpeg, WebM, WAV, AAC, OGG',
	videos: 'MP4, WebM, MOV, MKV, AVI',
	docs: 'PDF, DOC, DOCX, XLS, XLSX, TXT',
	media: 'Images or Videos (MP4, JPG, PNG, etc.)',
	all: 'Images, Videos, or Documents (PDF, DOCX, etc.)',
};

export const mimeTypes = {
	images: allowedMimeTypes.images,
	audios: allowedMimeTypes.audios,
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


// Helper to dynamically resolve mime types and friendly extensions from string or array
export const resolveFileTypes = (typeInput) => {
   const types = Array.isArray(typeInput) ? typeInput : [typeInput];
   
   const allowedMimes = [];
   const extensionsArray = [];
   
   for (const t of types) {
      if (mimeTypes[t]) {
         allowedMimes.push(...mimeTypes[t]);
      }
      if (friendlyExtensions[t]) {
         extensionsArray.push(friendlyExtensions[t]);
      }
   }
   
   return {
      allowedList: allowedMimes.length > 0 ? [...new Set(allowedMimes)] : null,
      friendlyMsg: extensionsArray.join(' or ')
   };
};