import { configEnv } from '../../config/env.js';

// format message and remove from field (sender) if message is anonymous
export function serializeMessage(message) {
	if (message.attachments && message.attachments?.length > 0) {
		message.attachments = message.attachments.map((attachment) => {
			return {
				url: `${configEnv.appUrl}/${attachment.url.replace(/\\/g, '/')}`,
				fileType: attachment.fileType,
			};
		});
	}
	return {
		id: message._id,
		content: message.content,
		attachments: message.attachments,
		createdAt: message.createdAt,
		isFavorite: message.isFavorite,
		from: message.isAnonymous ? null : message.from,
		to: message.to ? message.to : null,
	};
}
