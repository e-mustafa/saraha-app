import nodemailer from 'nodemailer';
import { configEnv, emailConfig } from '../config/env.js';
import asyncHandler from './error-handler/async-handler.js';

const transporter = nodemailer.createTransport({
	// host: emailConfig.smtp.host,
	// port: emailConfig.smtp.port,
	// secure: emailConfig.smtp.secure,
	service: 'gmail',
	auth: {
		user: emailConfig.googleEmail,
		pass: emailConfig.googleAppPassword,
	},
});

export const sendEmail = asyncHandler(async ({ to, subject, html }) => {
	const info = await transporter.sendMail({
		from: `${configEnv.appName} <${emailConfig.googleEmail}>`,
		to,
		subject,
		html,
	});

	console.log(info);
	return info;
});
