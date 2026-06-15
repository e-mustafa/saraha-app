import { Router } from 'express';

const router = Router();

export const routes = {
	base: '/auth',
	login: '/login',
	register: '/register',
};

export default router;
