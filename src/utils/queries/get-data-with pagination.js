export async function getDataWithPagination({
	Model,
	initQuery = {},
	search = '',
	searchField = 'content',
	page = 1,
	limit = 10,
	sort = '-createdAt',
	select = '-__v',
	populate = [],
}) {
	// 1. Parse and validate inputs to ensure they are safe numbers (>= 1)
	const parsedPage = Math.max(1, parseInt(page) || 1);
	const parsedLimit = Math.max(1, parseInt(limit) || 10);

	// Calculate the number of documents to skip
	const skip = (parsedPage - 1) * parsedLimit;

	// 2. Build the database query object dynamically
	const query = { ...initQuery };

	// If a search term is provided, add a case-insensitive partial match filter on the title
	if (search) {
		query[searchField] = {
			$regex: search, // Use Regular Expression for partial matching
			$options: 'i', // 'i' flag makes the search case-insensitive
		};
	}

	// 3. Execute both queries concurrently to optimize performance (saves a database round-trip)
	const [data, totalItems] = await Promise.all([
		Model.find(query)
			.lean()
			.select(select) // Exclude the version key automatically
			.sort(sort) // Sort from newest to oldest
			.skip(skip) // Skip documents for previous pages
			.limit(parsedLimit)
			.populate(populate), // Restrict the results to the limit size

		Model.countDocuments(query), // Get total count of documents matching the search criteria
	]);

	// 4. Calculate total number of available pages
	const totalPages = Math.ceil(totalItems / parsedLimit);

	// 5. Return the result combined with helpful metadata for the frontend
	return {
		metadata: {
			totalItems,
			totalPages,
			currentPage: parsedPage,
			limit: parsedLimit,
			hasNextPage: parsedPage < totalPages,
			hasPrevPage: parsedPage > 1,
		},
		data,
	};
}

export async function getAggregateWithPagination({
	Model,
	baseMatch = {}, // الفلترة الأساسية (مثل to و isPublic)
	additionalStages = [], // المراحل الإضافية (مثل $project لإخفاء الهوية)
	page = 1,
	limit = 10,
	sort = { createdAt: -1 }, // الترتيب ككائن جاهز للـ Aggregation
}) {
	const parsedPage = Math.max(1, parseInt(page) || 1);
	const parsedLimit = Math.max(1, parseInt(limit) || 10);
	const skip = (parsedPage - 1) * parsedLimit;

	// بناء الـ Pipeline الاحترافي باستخدام $facet
	const pipeline = [
		{ $match: baseMatch },
		...additionalStages,
		{
			$facet: {
				// المسار الأول: جلب البيانات المقسمة لصفحات
				metadata: [{ $count: 'totalItems' }],
				// المسار الثاني: جلب البيانات الفعلية
				data: [{ $sort: sort }, { $skip: skip }, { $limit: parsedLimit }],
			},
		},
	];

	const [result] = await Model.aggregate(pipeline);

	// استخراج الإجمالي بأمان (إذا كانت النتيجة فارغة نضع 0)
	const totalItems = result.metadata[0]?.totalItems || 0;
	const totalPages = Math.ceil(totalItems / parsedLimit);
	const data = result.data;

	return {
		metadata: {
			totalItems,
			totalPages,
			currentPage: parsedPage,
			limit: parsedLimit,
			hasNextPage: parsedPage < totalPages,
			hasPrevPage: parsedPage > 1,
		},
		data,
	};
}