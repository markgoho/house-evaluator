import { z } from 'zod';
import { CRITERION_WEIGHT, UI } from '$lib/constants';

export const criterionFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Criterion name is required')
		.max(UI.MAX_CRITERION_NAME_LENGTH, `Name must be ${UI.MAX_CRITERION_NAME_LENGTH} characters or less`),

	description: z
		.string()
		.max(
			UI.MAX_CRITERION_DESCRIPTION_LENGTH,
			`Description must be ${UI.MAX_CRITERION_DESCRIPTION_LENGTH} characters or less`
		)
		.nullable()
		.transform((value) => (value === '' ? null : value)),

	weight: z
		.number()
		.int('Weight must be a whole number')
		.min(CRITERION_WEIGHT.MIN, `Weight must be at least ${CRITERION_WEIGHT.MIN}`)
		.max(CRITERION_WEIGHT.MAX, `Weight must be at most ${CRITERION_WEIGHT.MAX}`)
});

export type CriterionFormSchema = z.infer<typeof criterionFormSchema>;
