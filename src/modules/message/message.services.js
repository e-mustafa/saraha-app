import { Types } from 'mongoose';
import Message from '../../DB/models/message.model.js';
import User from '../../DB/models/user.model.js';
import { MESSAGE_TYPE_ENUM } from '../../utils/enums/message.enum.js';
import { getAggregateWithPagination, getDataWithPagination } from '../../utils/queries/get-data-with pagination.js';
import { BadRequestException, NotFoundException } from '../../utils/response/throw.exceptions.js';
import { decrypt, encrypt } from '../../utils/security/encryption.security.js';
import { deleteMessageAttachments, uploadToCloudinaryMessage } from './message.utils.js';

// export const sendMessageService = async ({ userId, username, content, files, isAnonymous, saveToMyMessages = false }) => {
// 	let attachments = [];
// 	try {
// 		const receiver = await User.findOne({ username, deletedAt: null }).lean().select('_id username');
// 		if (!receiver) {
// 			if (attachments && attachments.length > 0) {
// 				attachments.forEach((attachment) => deleteFileHelper(attachment.url));
// 			}
// 			NotFoundException('User not found', 'SEND_MESSAGE.USER_NOT_FOUND');
// 		}

// 		if (files && files.length > 0) {
// 			attachments = files.map((file) => ({
// 				url: file.filePath,
// 				type: file.mimetype?.split('/')[0] || 'image',
// 			}));
// 		}

// 		// الرسائل تشفر دائماً في قاعدة البيانات لحماية الخصوصية كمبدأ أساسي (Secure by Default)
// 		const encryptedContent = encrypt(content);

// 		const message = await Message.create({
// 			content: encryptedContent,
// 			publicContent: null, // يبدأ دائماً بـ null حتى يقرر المستخدم نشرها
// 			to: receiver._id,
// 			from: userId && saveToMyMessages ? userId : undefined,
// 			attachments,
// 			isAnonymous,
// 			isPublic: false, // الافتراضي غير منشورة
// 		});

// 		return message;
// 	} catch (error) {
// 		if (attachments && attachments.length > 0) {
// 			attachments.forEach((attachment) => deleteFileHelper(attachment.url));
// 		}
// 		throw error;
// 	}
// };

export const sendMessageService = async ({ userId, username, content, files, isAnonymous, saveToMyMessages = false }) => {
	const receiver = await User.findOne({ username, deletedAt: null }).lean().select('_id username');
	if (!receiver) {
		// Fixed: Added missing 'throw'
		NotFoundException('User not found', 'SEND_MESSAGE.USER_NOT_FOUND');
	}

	// Generate message ID beforehand to use in Cloudinary folder paths if needed,
	// or rely on a custom unique generator since we upload before saving to DB.
	const tempMessageId = new Types.ObjectId();
	let attachments = [];

	// Upload files first to ensure data integrity
	if (files && files.length > 0) {
		try {
			attachments = await Promise.all(files.map((file) => uploadToCloudinaryMessage(receiver._id, file, tempMessageId)));
		} catch (error) {
			// Handle upload failure gracefully depending on your business logic
			BadRequestException(`Failed to upload attachments, ${error.message}`, 'SEND_MESSAGE.UPLOAD_FAILED');
		}
	}

	// Encrypt message content for privacy protection (Secure by Default)
	const encryptedContent = encrypt(content);

	// Create the message in one database operation
	const message = await Message.create({
		_id: tempMessageId,
		content: encryptedContent,
		publicContent: null, // default null until user decides to publish
		to: receiver._id,
		from: userId && saveToMyMessages ? userId : undefined,
		attachments,
		isAnonymous,
	});

	return message.toObject();
};

export const getPublicMessagesService = async (username, query = {}) => {
	const user = await User.findOne({ username }).lean().select('_id');
	if (!user) {
		NotFoundException('User not found', 'GET_PUBLIC_MESSAGES.USER_NOT_FOUND');
	}

	// const result = await getAggregateWithPagination({
	// 	Model: Message,
	// 	page: query.page,
	// 	limit: query.limit,
	// 	baseMatch: {
	// 		to: new Types.ObjectId(user._id),
	// 		isPublic: true,
	// 	},
	// 	sort: { createdAt: -1 },
	// 	additionalStages: [
	// 		{
	// 			$project: {
	// 				// سحب النص المقروء من حقل العامة وعرضه باسم content للفرونت إند
	// 				content: '$publicContent',
	// 				attachments: 1,
	// 				createdAt: 1,
	// 				isAnonymous: 1,
	// 				isPublic:1,
	// 				from: {
	// 					$cond: {
	// 						if: { $eq: ['$isAnonymous', true] },
	// 						then: '$$REMOVE',
	// 						else: '$from',
	// 					},
	// 				},
	// 			},

	// 		},
	// 	],
	// });

	const result = await getAggregateWithPagination({
		Model: Message,
		page: query.page,
		limit: query.limit,
		baseMatch: {
			to: new Types.ObjectId(user._id),
			isPublic: true,
		},
		sort: { createdAt: -1 },
		additionalStages: [
			// 1. ربط مجموعة الرسائل بمجموعة المستخدمين (Users) لجلب بيانات المرسل
			{
				$lookup: {
					from: 'users', // تأكد أن هذا الاسم يطابق اسم الـ Collection الفعلي في قاعدة البيانات (غالباً users بالجمع)
					localField: 'from',
					foreignField: '_id',
					as: 'sender',
				},
			},
			// 2. تحويل مصفوفة sender الناتجة من الـ lookup إلى كائن واحد نَشِط
			{
				$unwind: {
					path: '$sender',
					preserveNullAndEmptyArrays: true, // هامة جداً لكي لا تختفي الرسائل المرسلة من زوار غير مسجلين
				},
			},
			// 3. صياغة وتشكيل المخرج النهائي للبيانات
			{
				$project: {
					content: '$publicContent',
					attachments: 1,
					createdAt: 1,
					isAnonymous: 1,
					isPublic: 1,
					// التحكم الذكي في حقل from بناءً على مجهولية الرسالة
					from: {
						$cond: {
							if: { $eq: ['$isAnonymous', true] },
							then: '$$REMOVE', // إذا كانت مجهولة، يتم تدمير حقل from تماماً لحماية الخوية
							else: {
								// إذا كانت علنية، نمرر الكائن بالحقول التي يتوقعها الـ DTO للتنسيق
								_id: '$sender._id',
								username: '$sender.username',
								avatar: '$sender.avatar',
								firstName: '$sender.firstName',
								lastName: '$sender.lastName',
							},
						},
					},
				},
			},
		],
	});

	return result;
};

export const getMessagesService = async (userId, query = {}) => {
	const type = query.type || MESSAGE_TYPE_ENUM.INBOX;
	let filter;
	let populate = null;

	switch (type) {
		case MESSAGE_TYPE_ENUM.INBOX:
			filter = { to: userId };
			populate = {
				path: 'from',
				select: 'username firstName lastName avatar',
			};
			break;
		case MESSAGE_TYPE_ENUM.SENT:
			filter = { from: userId };
			populate = {
				path: 'to',
				select: 'username firstName lastName avatar',
			};
			break;
		case MESSAGE_TYPE_ENUM.FAVORITES:
			filter = {
				$and: [{ $or: [{ to: userId }, { from: userId }] }, { $or: [{ toFavorite: true }, { fromFavorite: true }] }],
			};
			populate = {
				path: 'from',
				select: 'username firstName lastName avatar',
			};
			break;
		case MESSAGE_TYPE_ENUM.PUBLIC:
			filter = { to: userId, isPublic: true };
			break;

		default:
			filter = {};
			break;
	}

	const result = await getDataWithPagination({
		Model: Message,
		initQuery: filter,
		search: query.content || '',
		searchField: 'content',
		page: query.page || 1,
		limit: query.limit || 10,
		sort: query.sort || '-createdAt',
		...(populate && { populate }),
	});

	// decrypt content for owner
	if (result.data && result.data.length > 0) {
		result.data = result.data.map((message) => ({
			...message,
			content: message.content ? decrypt(message.content) : '',
		}));
	}

	return result;
};

export const getMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, $or: [{ to: userId }, { from: userId }] })
		.populate('from', 'username firstName lastName avatar')
		.lean();

	if (!message) {
		NotFoundException('Message not found, or you not authorized to view this message', 'GET_MESSAGE.MESSAGE_NOT_FOUND');
	}

	// فك تشفير محتوى الرسالة الفردية الخاصة
	if (message.content) {
		message.content = decrypt(message.content);
	}

	return message;
};

export const deleteMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, $or: [{ to: userId }, { from: userId }] });
	if (!message) {
		NotFoundException(
			'Message not found, or you not authorized to delete this message',
			'DELETE_MESSAGE.MESSAGE_NOT_FOUND',
		);
	}

	if (message.from && message.from.toString() === userId) {
		message.from = null;
	} else if (message.to && message.to.toString() === userId) {
		message.to = null;
	}

	if (!message.from && !message.to) {
		await message.deleteOne();
		// delete attachments if any - local upload
		// if (message.attachments && message.attachments.length > 0) {
		// 	for (const attachment of message.attachments) {
		// 		await deleteFileHelper(attachment.url);
		// 	}
		// }

		// delete message attachments from cloudinary
		await deleteMessageAttachments(message.attachments);
	} else {
		await message.save();
	}

	return message;
};

export const toggleFavoriteMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, $or: [{ to: userId }, { from: userId }] });
	if (!message) {
		NotFoundException(
			'Message not found, or you not authorized to edit this message',
			'TOGGLE_FAVORITE_MESSAGE.MESSAGE_NOT_FOUND',
		);
	}

	const data = {};
	if (message.to && message.to.toString() === userId) {
		message.toFavorite = !message.toFavorite;
		data.toFavorite = message.toFavorite;
		data.newState = message.toFavorite;
	} else if (message.from && message.from.toString() === userId) {
		message.fromFavorite = !message.fromFavorite;
		data.fromFavorite = message.fromFavorite;
		data.newState = message.fromFavorite;
	}
	await message.save();

	return data;
};

export const togglePublicMessageService = async (userId, messageId) => {
	const message = await Message.findOne({ _id: messageId, to: userId });
	if (!message) {
		NotFoundException(
			'Message not found, or you not authorized to edit this message',
			'TOGGLE_PUBLIC_MESSAGE.MESSAGE_NOT_FOUND',
		);
	}

	const data = {};
	message.isPublic = !message.isPublic;
	data.isPublic = message.isPublic;
	data.newState = message.isPublic;

	await message.save();

	return data;
};
