export function getTaskTimeStatus(start: string, end: string) {
	const now = new Date();
	now.setHours(0, 0, 0, 0);

	const startDate = new Date(start);
	startDate.setHours(0, 0, 0, 0);

	const endDate = new Date(end);
	endDate.setHours(23, 59, 59, 999);

	if (now < startDate) return "未開始";
	if (now > endDate) return "已結束";
	return "進行中";
}