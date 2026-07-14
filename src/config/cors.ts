import { configEnv } from './env.js';

export const corsOptions = {
	origin: [configEnv.frontendUrl, ...(configEnv.allowedOrigin?.split(',') || [])],
	credentials: true,
};
