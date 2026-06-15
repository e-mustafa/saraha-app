export async function getDataWithPagination({
	Model,
	initQuery = {},
	search = '',
	page = 1,
	limit = 10,
	sort = '-createdAt',
	select = '-__v',
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
		query.title = {
			$regex: search, // Use Regular Expression for partial matching
			$options: 'i', // 'i' flag makes the search case-insensitive
		};
	}

	// 3. Execute both queries concurrently to optimize performance (saves a database round-trip)
	const [data, totalItems] = await Promise.all([
		Model.find(query)
			.select(select) // Exclude the version key automatically
			.sort(sort) // Sort from newest to oldest
			.skip(skip) // Skip documents for previous pages
			.limit(parsedLimit), // Restrict the results to the limit size

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
