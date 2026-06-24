export const generateOTP = (length = 6) => {
	const min = Math.pow(10, length - 1);
	const max = Math.pow(10, length) - min;
	return Math.floor(min + Math.random() * max).toString();
};

// export const generateOTP = () => {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// };
