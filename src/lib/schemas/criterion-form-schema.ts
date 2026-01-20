import { z } from 'zod';

export const criterionFormSchema = z.object({
	name: z.string().min(1, 'Criterion name is required').max(100, 'Name must be 100 characters or less'),

	description: z
		.string()
		.max(500, 'Description must be 500 characters or less')
		.nullable()
		.transform((value) => (value === '' ? null : value)),

	weight: z
		.number()
		.int('Weight must be a whole number')
		.min(1, 'Weight must be at least 1')
		.max(10, 'Weight must be at most 10')
});

export type CriterionFormSchema = z.infer<typeof criterionFormSchema>;
