export const responseSuccess = ({ res, data, message, status = 200, more = {} }) => {
	return res.status(status).json({ success: true, message, ...more, data });
};
