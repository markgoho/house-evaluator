import type { Rating } from "$lib/types";

/**
 * Normalizes rating scores from scale version 1 (-5 to +5) to scale version 2 (0 to 5).
 *
 * If the rating is already on scale version 2, it is returned unchanged.
 * Otherwise:
 * - criteriaScores: Each score is transformed using Math.round((score + 5) / 2)
 *   - Maps -5→0, -3→1, -1→2, 0→3, 1→3, 3→4, 5→5
 * - overallScore: Transformed using Math.round(((score + 5) / 2) * 10) / 10
 *   - Keeps 1 decimal precision
 * - scaleVersion: Set to 2
 *
 * @param rating - The rating to normalize
 * @returns A new Rating object with normalized scores (does not mutate input)
 */
export function normalizeRatingScores(rating: Rating): Rating {
	// If already version 2, return unchanged
	if (rating.scaleVersion === 2) {
		return rating;
	}

	// Normalize criteriaScores: apply Math.round((score + 5) / 2) to each score
	const normalizedCriteriaScores: Record<string, number> = {};
	for (const [criterionId, score] of Object.entries(rating.criteriaScores)) {
		normalizedCriteriaScores[criterionId] = Math.round((score + 5) / 2);
	}

	// Normalize overallScore: apply Math.round(((score + 5) / 2) * 10) / 10
	const normalizedOverallScore = Math.round(((rating.overallScore + 5) / 2) * 10) / 10;

	// Return new object with normalized scores and scaleVersion set to 2
	return {
		...rating,
		criteriaScores: normalizedCriteriaScores,
		overallScore: normalizedOverallScore,
		scaleVersion: 2,
	};
}
