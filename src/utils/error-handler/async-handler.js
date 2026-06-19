const asyncHandler = (fn) => {
	return async (req, res, next) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};

// const asyncHandler = (fn) => (req, res, next) => {
// 	Promise.resolve(fn(req, res, next)).catch(next);
// };

// const asyncHandler = (fn) => {
// 	return async (req, res, next) => {
// 		fn(req, res, next).catch(next);
// 	};
// };

export default asyncHandler;
