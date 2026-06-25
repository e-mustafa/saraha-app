export function calcAge(value) {
	if (!value) return null;

	const today = new Date();
	const birthDate = new Date(value);
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();

	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}
