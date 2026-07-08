export const successResponse = ({ res, data, message, status = 200, ...rest }) => {
	return res.status(status).json({ success: true, message, ...rest, data });
};
