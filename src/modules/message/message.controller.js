import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { deleteMessageService, getMessageService, getMessagesService, sendMessageService } from './message.services.js';

// @desc    Send an anonymous message
// @route   POST /messages/:username
export const sendMessages = asyncHandler(async (req, res) => {
	const { user, body, params, files } = req || {};
	const data = await sendMessageService({
		userId: user._id || null,
		username: params.username,
		files,
		...body,
	});
	successResponse({ res, message: 'Message sent successfully', data });
});

export const getMessages = asyncHandler(async (req, res) => {
	const { user } = req || {};
	const data = await getMessagesService(user._id);
	successResponse({ res, message: 'Messages retrieved successfully', data });
});

// get messages by type (inbox, sent, favorites)
export const getMessagesType = (type) =>
	asyncHandler(async (req, res) => {
		const { user, query } = req || {};
		const data = await getMessagesService(user._id, type, query);
		successResponse({ res, data });
	});
// get single message by id
export const getMessage = asyncHandler(async (req, res) => {
	const { user, params } = req || {};
	const data = await getMessageService(user._id, params.id || '');
	successResponse({ res, data });
});

// delete message by id
export const deleteMessage = asyncHandler(async (req, res) => {
	const { user, params } = req || {};
	console.log(user);
	await deleteMessageService(user._id, params.id || '');
	successResponse({ res, message: 'Message deleted successfully' });
});
