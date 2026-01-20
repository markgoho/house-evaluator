import { z } from 'zod';

export const ratingFormSchema = z.object({
	// criteriaScores is a Record<string, number> where each score is -5 to +5
	criteriaScores: z.record(
		z.string(),
		z
			.number()
			.int('Score must be a whole number')
			.min(-5, 'Score must be at least -5')
			.max(5, 'Score must be at most +5')
	),

	comments: z
		.string()
		.max(1000, 'Comments must be 1000 characters or less')
		.nullable()
		.transform((value) => (value === '' ? null : value))
});

export type RatingFormSchema = z.infer<typeof ratingFormSchema>;
