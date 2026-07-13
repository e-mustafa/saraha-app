export const appConfig = {
	otp: {
		resetPassword: {
			expiresIn: 60 * 15, // 10 minutes
		},
		changeEmail: {
			expiresIn: 60 * 15, // 10 minutes
		},
		verifyEmail: {
			expiresIn: 60 * 15, // 10 minutes
		},
		revertEmail: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
		},
		refreshToken: {
			expiresIn: 60 * 60 * 24 * 7, // 7 days
		},
	},
	messages: {
		maxMessageLength: 1000,
		maxAttachmentsPerMessage: 4,
		maxAttachmentSize: 10 * 1024 * 1024, // 10MB

		maxMessagesPerMinute: 10,
		allowedAttachmentTypes: [
			'image/jpeg',
			'image/png',
			'image/gif',
			'image/webp',
			'image/svg+xml',
			'image/bmp',
			'image/tiff',
			'image/heic',
			'image/heif',
			'image/avif',
		],
	},
	security: {
		minPasswordLength: 8,
	},
};

export const frontendUrls = {
	resetPassword: '/auth/reset-password',
	revertEmail: '/auth/revert-email',
};

export const personSettings = {
	user: {
		isPublicAccount: true,
		showEmail: true,
		showVisitorCount: true,
		showConnectionStatus: true,
		showLastSeen: true,
		showInSearch: true,
	},
	messages: {
		acceptAttachments: true,
		visitorCanSendMessages: true,
	},
};

export const messageConfig = {
	saveToMyMessages: true, // Save messages to user's message history
	anonymous: true, // Messages are sent without revealing sender's identity
	isPublic: false, // Messages are encrypted and only visible to sender and receiver
};
