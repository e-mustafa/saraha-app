import jwt from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { configEnv } from '../../config/env.js';
import User from '../../DB/models/user.model.js';
import { sendOtpEmail } from '../../utils/emails/otp.email.js';
import { sendResetPasswordEmail } from '../../utils/emails/reset-password.email.js';
import { TOKEN_TYPES_ENUM } from '../../utils/enums/security,enum.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import { otpServices } from '../../utils/redis/otp-service.redis.js';
import { resetPasswordServices } from '../../utils/redis/reset-password-service.redis.js';
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
	throwException,
	UnauthorizedException,
} from '../../utils/response/throw.exceptions.js';
import { generateHash, verifyHash } from '../../utils/security/hash.security.js';
import { generateOTP } from '../../utils/security/otp.security.js';
import { verifyOAuth2Google } from '../../utils/security/tokens/providers/google.token.js';
import { generateTokens, getSignature } from '../../utils/security/tokens/token.js';

export const registerService = async ({ firstName, lastName, username, email, password, phone, gender, birthdate }) => {
	// if (!firstName || !lastName || !username || !email || !password || !phone || gender === undefined || !birthdate) {
	// 	NotFoundException('Please enter required fields', 'registerService');
	// }
	// check if user already exists
	const isExist = await User.findOne({ email });
	if (isExist) {
		ConflictException('This email is already registered', 'registerService', {
			body: { email: 'This email is already registered' },
		});
	}

	const otp = generateOTP();
	const hashedOtp = await generateHash(otp, null, true);

	const user = await User.create({
		firstName,
		lastName,
		username,
		email,
		password, //: hashedPassword, in user model password is hashed automatically with pre save middleware
		// phone, //: encryptedPhone, in user model phone is encrypted automatically with pre save middleware
		// gender,
		// birthdate,
		// otp,
	});

	// save otp in redis with expiration of 5 minutes
	await otpServices.set(user._id, hashedOtp); // save in redis hashed otp

	// send otp email, don't wait for it to finish
	sendOtpEmail(email, otp);

	return user;
};

export const loginService = async ({ email, password, rememberMe = false }) => {
	// if (!email || !password) {
	// 	BadRequestException('Please enter required fields email and password', 'loginService-missing-fields');
	// }

	const user = await User.findOne({ email });
	if (!user) {
		NotFoundException('Invalid email or password', 'loginService-invalid-email');
	}

	const isPasswordValid = await verifyHash(password, user.password);
	if (!isPasswordValid) {
		UnauthorizedException('Invalid email or password', 'loginService-invalid-password');
	}

	const tokens = generateTokens(user, rememberMe);
	return tokens;
};

export const refreshAccessTokenService = async (refreshToken) => {
	if (!refreshToken) {
		UnauthorizedException('Refresh token is required, please login again.', 'refreshAccessTokenService-missing-token');
	}

	// decode token to get role and id
	const decodedPayload = jwt.decode(refreshToken) || {};

	if (!decodedPayload.aud || !decodedPayload.id) {
		UnauthorizedException('Refresh token is corrupted.', 'refreshAccessTokenService-invalid-token');
	}

	// get signature by audience
	const signature = getSignature(decodedPayload.aud);

	// verify refresh token
	let decoded;
	try {
		decoded = jwt.verify(refreshToken, signature.REFRESH_TOKEN_SECRET);
	} catch (error) {
		UnauthorizedException(
			// error.message ||
			'Refresh token is expired or invalid.',
			'refreshAccessTokenService-invalid-token',
		);
	}

	// get user from database by id to check if user is active and not banned
	const user = await User.findById(decoded.id).lean();
	if (!user) {
		UnauthorizedException('User associated with this token no longer exists.', 'refreshAccessTokenService-user-not-found');
	}

	// generate access token
	const { accessToken } = generateTokens(user, TOKEN_TYPES_ENUM.ACCESS);

	return { accessToken };
	// } catch (error) {
	// 	// throw exception if token is expired or invalid
	// 	UnauthorizedException(
	// 		'Refresh token expired or invalid. Please login again.',
	// 		'refreshAccessTokenService-token-expired',
	// 	);
	// }
};

export const socialLoginService = async (provider, idToken) => {
	if (!provider || !Object.values(PROVIDERS_ENUM).includes(provider)) {
		BadRequestException('Invalid provider', 'socialLoginService-invalid-provider');
	}

	let payload = {};
	if (provider === PROVIDERS_ENUM.GOOGLE) {
		payload = await verifyOAuth2Google(idToken);
	}

	// payload = await verifyOAuth2Google(idToken);

	const { email_verified, email, given_name, family_name, picture } = payload;

	if (!email_verified) BadRequestException('Email not verified, Use another account', 'socialLogin-google');

	const user = await User.findOne({ email }).lean();
	if (user) {
		// login existing user ->> generate access token
		if (user.provider !== PROVIDERS_ENUM.GOOGLE) {
			if (user.provider === PROVIDERS_ENUM.SYSTEM) {
				BadRequestException('User already exists, please login with your password', 'socialLogin-user-exists-system');
			} else {
				BadRequestException('User already exists with different provider', 'socialLogin-user-exists-different-provider');
			}
		}
		// generate access token
		const tokens = generateTokens(user);
		return { isNew: false, tokens }; // message: 'Login successfully'
	}

	// Register create new user
	const newUser = await User.create({
		email,
		firstName: given_name,
		lastName: family_name,
		username: `${email.split('@')[0]}_${Math.floor(Math.random() * 1000)}`,
		avatar: picture,
		provider,
	});
	// generate access token
	const tokens = generateTokens(newUser);
	return { isNew: true, tokens }; // message: 'User created successfully'
};

export const verifyEmailService = async (email, otp) => {
	// if (!email || !otp) {
	// 	BadRequestException('Email and OTP are required', 'verifyEmailService-missing-params');
	// }

	// const user = await User.findOne({ email, deletedAt: null });
	const user = await User.findOne({ email });
	if (!user) {
		NotFoundException('User not found', 'verifyEmailService-user-not-found');
	}

	if (!user.isActive || user.deletedAt) {
		BadRequestException('User is not active or deleted', 'verifyEmailService-user-not-active');
	}

	if (user.verified) {
		BadRequestException('User already verified', 'verifyEmailService-user-already-verified');
	}

	const userOtp = await otpServices.get(user._id);
	const isValidOtp = await verifyHash(otp, userOtp);
	if (isValidOtp) {
		BadRequestException('Invalid or expired OTP', 'verifyEmailService-invalid-otp');
	}

	user.verified = Date.now().toString();
	await user.save();

	await otpServices.delete(user._id);

	return true;
};

export const resendOtpService = async (email) => {
	// if (!email || !otp) {
	// 	BadRequestException('Email and OTP are required', 'verifyEmailService-missing-params');
	// }

	const user = await User.findOne({ email });
	if (!user) {
		NotFoundException('User not found', 'verifyEmailService-user-not-found');
	}

	if (!user.isActive || user.deletedAt) {
		BadRequestException('User is not active or deleted', 'verifyEmailService-user-not-active');
	}

	if (user.verified) {
		BadRequestException('User already verified', 'verifyEmailService-user-already-verified');
	}

	const existOtp = await otpServices.get(user._id);
	if (existOtp) {
		const otpTtl = await otpServices.tll(user._id);
		if (otpTtl > 0) {
			// only wait 1m before sending new otp, no need to wait 5 minutes
			BadRequestException('OTP is still valid, please wait one minute', 'verifyEmailService-otp-still-valid');
		}
	}

	const otp = generateOTP();
	const hashedOtp = await generateHash(otp, null, true);
	console.log('otp', otp);

	await otpServices.set(user._id, hashedOtp);
	sendOtpEmail(email, otp);

	return true;
};

export const forgetPasswordService = async (email) => {
	const user = await User.findOne({ email });
	if (!user) {
		return false;
	}

	const resetToken = randomBytes(32)?.toString('hex');
	const hashedToken = createHash('sha256').update(resetToken).digest('hex');

	await resetPasswordServices.set(hashedToken, user._id.toString());

	const link = `${configEnv.frontendUrl}/auth/reset-password?token=${resetToken}`;
	sendResetPasswordEmail(user.email, link, `${user.firstName} ${user.lastName}`);

	return true;
};

export const resetPasswordService = async (token, password) => {
	const hashedToken = createHash('sha256').update(token).digest('hex');

	const userId = await resetPasswordServices.get(hashedToken);
	if (!userId) {
		BadRequestException('This link is invalid or expired!', 'resetPasswordService-invalid-token');
	}

	const user = await User.findById(userId);
	if (!user) {
		BadRequestException('This link is invalid or expired!', 'resetPasswordService-user-not-found');
	}

	user.password = password;
	user.passwordChangedAt = Date.now();
	await user.save();

	await resetPasswordServices.delete(hashedToken);

	return true;
};

export const changePasswordService = async ({ userId, oldPassword, newPassword, isConfirmed }) => {
	if (oldPassword == newPassword) {
		BadRequestException('New password cannot be the same as the current password', 'changePasswordService-same-password');
	}

	if (!isConfirmed) {
		BadRequestException('New Password must be confirmed', 'changePasswordService-password-confirmation-required');
	}

	const user = await User.findById(userId);
	if (!user) {
		NotFoundException('User not found', 'changePasswordService-user-not-found');
	}

	if (!user.isActive || user.deletedAt) {
		BadRequestException('User is not active or deleted', 'changePasswordService-user-not-active');
	}

	if (!user.verified) {
		BadRequestException('User not verified', 'changePasswordService-user-not-verified');
	}

	const isPasswordCorrect = await verifyHash(oldPassword, user.password);
	if (!isPasswordCorrect) {
		// BadRequestException('Invalid old password', 'changePasswordService-invalid-old-password');
		throwException(400, 'Invalid old password', 'changePasswordService-invalid-old-password', {
			oldPassword: 'Invalid old password',
		});
	}

	user.password = newPassword;
	user.passwordChangedAt = Date.now();
	await user.save();

	return true;
};
