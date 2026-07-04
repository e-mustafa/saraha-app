import { Router } from 'express';
import { auth, authOptional } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import { MESSAGE_TYPE_ENUM } from '../../utils/enums/message.enum.js';
import { localUpload } from '../../utils/upload-files/local.multer.js';
import { fileTypes } from '../../utils/upload-files/mime-types.js';
import { deleteMessage, getMessage, getMessagesType, sendMessages } from './message.controller.js';
import { deleteMessageSchema, getMessageSchema, sendMessageSchema } from './message.validation.js';

const router = Router();

export const routes = {
	base: '/messages',

	sendMessages: '/:username',
	getMyMessages: '/',

	getInbox: '/inbox',
	getSent: '/sent',
	getFavorites: '/favorites',
	// getArchived: '/archived',

	getMessage: '/:id',
	deleteMessage: '/:id',
};

router.post(
	routes.sendMessages,
	authOptional(),
	localUpload({ dir: 'messages', type: fileTypes.media }).array('attachments', 2),
	validation(sendMessageSchema),
	sendMessages,
);

// router.get(routes.getMyMessages, auth(), getMessages);

router.get(routes.getInbox, auth(), getMessagesType(MESSAGE_TYPE_ENUM.INBOX));
router.get(routes.getSent, auth(), getMessagesType(MESSAGE_TYPE_ENUM.SENT));
router.get(routes.getFavorites, auth(), getMessagesType(MESSAGE_TYPE_ENUM.FAVORITES));
// router.get(routes.getArchived, auth(), getMessagesCtrl);

router.get(routes.getMessage, auth(), validation(getMessageSchema), getMessage);
router.delete(routes.deleteMessage, auth(), validation(deleteMessageSchema), deleteMessage);

export default router;
