import { z } from 'zod';
import { RATING, UI } from '$lib/constants';

export const ratingFormSchema = z.object({
	// criteriaScores is a Record<string, number> where each score is min to max
	criteriaScores: z.record(
		z.string(),
		z
			.number()
			.int('Score must be a whole number')
			.min(RATING.MIN, `Score must be at least ${RATING.MIN}`)
			.max(RATING.MAX, `Score must be at most +${RATING.MAX}`)
	),

	comments: z
		.string()
		.max(UI.MAX_RATING_COMMENTS_LENGTH, `Comments must be ${UI.MAX_RATING_COMMENTS_LENGTH} characters or less`)
		.nullable()
		.transform((value) => (value === '' ? null : value))
});

export type RatingFormSchema = z.infer<typeof ratingFormSchema>;
