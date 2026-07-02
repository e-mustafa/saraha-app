import { jwtSignatureLevel } from '../../config/env.js';
import { cookiesKeysEnum } from '../enums/security,enum.js';

export function setCookies(res, data) {
	if (!res || !data) return;
	const options = { httpOnly: true, secure: true, sameSite: 'lax' };

	// set access token in cookie
	if (data.accessToken) {
		res.cookie(cookiesKeysEnum.accessToken, `Bearer ${data?.accessToken}`, {
			...options,
			maxAge: Number(data?.accessExpiration) * 1000 || 1000 * 60 * 15, // 15 minutes if not provided
		});
	}

	// set refresh token in cookie
	if (data.refreshToken) {
		res.cookie(cookiesKeysEnum.refreshToken, `Bearer ${data?.refreshToken}`, {
			...options,
			maxAge: Number(data?.refreshExpiration) * 1000 || Number(jwtSignatureLevel.user.REFRESH_TOKEN_EXPIRES), // exp dependent on rememberMe
		});
	}
}
