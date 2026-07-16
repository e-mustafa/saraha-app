import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import {
	deleteMessageService,
	getMessageService,
	getMessagesService,
	getPublicMessagesService,
	sendMessageService,
	toggleFavoriteMessageService,
} from './message.services.js';
import { MessageDTO } from './message.utils.js';

// @desc    Send an anonymous message
// @route   POST /messages/:username
export const sendMessages = asyncHandler(async (req, res) => {
	const { user, body, params, files } = req || {};
	const messages = await sendMessageService({
		userId: user?._id || null,
		username: params.username,
		files: body.attachments,
		...body,
	});

	// format message and remove from field (sender) if message is anonymous
	const data = MessageDTO.single(messages);
	successResponse({ res, message: 'Message sent successfully', data });
});

export const getPublicMessages = asyncHandler(async (req, res) => {
	const { params, query } = req || {};
	const { data, metadata } = await getPublicMessagesService(params.username, query);

	// format messages and remove from field (sender) if message is anonymous
	const formattedData = MessageDTO.list(data, false);
	successResponse({ res, data: formattedData, metadata });
});

// export const getMessages = asyncHandler(async (req, res) => {
// 	const { user } = req || {};
// 	const data = await getMessagesService(user._id);

// 	// format messages and remove from field (sender) if message is anonymous
// 	data.data = MessageDTO.list(data.data, !!user.role);
// 	successResponse({ res, message: 'Messages retrieved successfully', data });
// });

// get messages by type (inbox, sent, favorites)
export const getMessages = () =>
	asyncHandler(async (req, res) => {
		const { user, query } = req || {};
		const { metadata, data } = await getMessagesService(user._id, query);

		// format messages and remove from field (sender) if message is anonymous
		const formattedData = MessageDTO.list(data, !!user.role);
		successResponse({ res, data: formattedData, metadata });
	});

// get single message by id
export const getMessage = asyncHandler(async (req, res) => {
	const { user, params } = req || {};
	const message = await getMessageService(user._id, params.id || '');
	const data = MessageDTO.single(message, !!user.role);
	successResponse({ res, data });
});

// delete message by id
export const deleteMessage = asyncHandler(async (req, res) => {
	const { user, params } = req || {};
	await deleteMessageService(user._id, params.id || '');
	successResponse({ res, message: 'Message deleted successfully' });
});

// toggle favorite message by id
export const toggleFavoriteMessage = asyncHandler(async (req, res) => {
	const { user, params } = req || {};
	const { newState, ...reset } = await toggleFavoriteMessageService(user._id, params.id || '');
	successResponse({
		res,
		message: newState ? 'Message marked as favorite' : 'Message removed from favorites',
		data: reset,
	});
});
