import Message from '../../DB/models/message.model.js';
import User from '../../DB/models/user.model.js';
import { MESSAGE_TYPE_ENUM } from '../../utils/enums/message.enum.js';
import { deleteFileHelper } from '../../utils/general/file.util.js';
import { getDataWithPagination } from '../../utils/queries/get-data-with pagination.js';
import { NotFoundException } from '../../utils/response/throw.exceptions.js';
import { serializeMessage } from './message.utils.js';

export const sendMessageService = async ({
	userId,
	username,
	content,
	files,
	isConfidential,
	isAnonymous,
	saveToMyMessages = false,
}) => {
	let attachments = [];
	try {
		// if (userId) {
		//    const userSettings = await User.findById(userId).select('settings');
		// }

		if (files && files.length > 0) {
			attachments = files?.map((file) => ({
				url: file.filePath,
				fileType: file.mimetype?.split('/')[0] || 'image',
			}));
		}

		const receiver = await User.findOne({ username, deletedAt: null }).lean().select('_id username');
		if (!receiver) {
			if (attachments && attachments.length > 0) {
				attachments.forEach((attachment) => {
					deleteFileHelper(attachment.url);
				});
			}

			NotFoundException('User not found', 'SEND_MESSAGE.USER_NOT_FOUND');
		}

		const message = await Message.create({
			content,
			to: receiver._id,
			from: userId && saveToMyMessages ? userId : undefined,
			attachments,
			isConfidential,
			isAnonymous,
		});
		return message;
	} catch (error) {
		if (attachments && attachments.length > 0) {
			attachments.forEach((attachment) => {
				deleteFileHelper(attachment.url);
			});
		}
		throw error;
	}
};

export const getMessagesService = async (userId, type = MESSAGE_TYPE_ENUM.INBOX, query = {}) => {
	const find = {
		population: {
			path: 'from',
			select: 'username firstName lastName profileImage',
		},
	};

	switch (type) {
		case MESSAGE_TYPE_ENUM.INBOX:
			find.filter = { to: userId };
			find.population.path = 'from';
			find.population.select = 'username firstName lastName profileImage';
			break;
		case MESSAGE_TYPE_ENUM.SENT:
			find.filter = { from: userId };
			find.population.path = 'to';
			find.population.select = 'username firstName lastName profileImage';
			break;
		case MESSAGE_TYPE_ENUM.FAVORITES:
			find.filter = { to: userId, isFavorite: true };
			find.population.path = 'from';
			find.population.select = 'username firstName lastName profileImage';
			break;
		default:
			find.filter = {};
			find.population.path = '';
			find.population.select = '';
			break;
	}

	const data = await getDataWithPagination({
		Model: Message,
		initQuery: find.filter,
		search: query.content || '',
		searchField: 'content',
		page: query.page || 1,
		limit: query.limit || 10,
		sort: query.sort || '-createdAt',
		// select: '-__v',
		populate: find.population,
	});

	return {
		...data,
		// format message and remove from field (sender) if message is anonymous
		data: data.data.map(serializeMessage),
	};
};

export const getMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, $or: [{ to: userId }, { from: userId }] })
		.populate('from', 'username firstName lastName profileImage')
		.lean();
	if (!message) {
		NotFoundException('Message not found, or you not authorized to view this message', 'GET_MESSAGE.MESSAGE_NOT_FOUND');
	}
	return serializeMessage(message);
};

export const deleteMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, $or: [{ to: userId }, { from: userId }] });
	if (!message) {
		NotFoundException('Message not found, or you not authorized to delete this message', 'DELETE_MESSAGE.MESSAGE_NOT_FOUND');
	}

	if (message.from && message.from.toString() === userId) {
		message.from = null;
	} else if (message.to && message.to.toString() === userId) {
		message.to = null;
	}

	if (!message.from && !message.to) {
		await message.deleteOne();
	} else {
		await message.save();
	}

	return message;
};
