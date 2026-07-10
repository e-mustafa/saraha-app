import { Router } from 'express';
import { auth, authOptional } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import { localUpload } from '../../utils/upload-files/local.multer.js';
import { fileTypes } from '../../utils/upload-files/mime-types.js';
import {
	deleteMessage,
	getMessage,
	getMessages,
	getPublicMessages,
	sendMessages,
	toggleFavoriteMessage,
} from './message.controller.js';
import {
	deleteMessageSchema,
	getMessageSchema,
	getPublicMessageSchema,
	sendMessageSchema,
	toggleMessageSchema,
} from './message.validation.js';

const router = Router();

export const routes = {
	base: '/messages',

	sendMessages: '/public/:username',
	getPublicMessages: '/public/:username',

	// ?type=favorites
	getMyMessages: '/',

	// getInbox: '/inbox',
	// getSent: '/sent',
	// getFavorites: '/favorites',
	// getPublic: '/public',

	getMessage: '/:id',
	deleteMessage: '/:id',
	toggleFavorite: '/:id/favorite',
};

router.post(
	routes.sendMessages,
	authOptional(),
	localUpload({ dir: 'messages', type: fileTypes.media }).array('attachments', 2),
	validation(sendMessageSchema),
	sendMessages,
);

// get public messages
router.get(routes.getPublicMessages, validation(getPublicMessageSchema), getPublicMessages);

// router.get(routes.getMyMessages, auth(), getMessages);

router.get(routes.getMyMessages, auth(), getMessages());
// router.get(routes.getSent, auth(), getMessagesType(MESSAGE_TYPE_ENUM.SENT));
// router.get(routes.getFavorites, auth(), getMessagesType(MESSAGE_TYPE_ENUM.FAVORITES));
// router.get(routes.getArchived, auth(), getMessagesCtrl);

router.get(routes.getMessage, auth(), validation(getMessageSchema), getMessage);
router.delete(routes.deleteMessage, auth(), validation(deleteMessageSchema), deleteMessage);
router.patch(routes.toggleFavorite, auth(), validation(toggleMessageSchema), toggleFavoriteMessage);

export default router;
