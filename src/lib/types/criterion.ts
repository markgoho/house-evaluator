export interface Criterion {
	id: string;
	familyId: string;
	name: string;
	description: string | null;
	weight: number; // 1-10 importance scale
	order: number; // for sorting
	createdAt: Date;
	updatedAt: Date;
}

export type CriterionInput = Omit<Criterion, 'id' | 'createdAt' | 'updatedAt'>;
export type CriterionUpdate = Partial<CriterionInput>;

// Default criteria for new families
export const DEFAULT_CRITERIA: Array<Omit<CriterionInput, 'familyId'>> = [
	{
		name: 'Location',
		description: 'Proximity to work, schools, amenities',
		weight: 9,
		order: 0
	},
	{
		name: 'Condition',
		description: 'Overall property condition and maintenance',
		weight: 8,
		order: 1
	},
	{
		name: 'Layout',
		description: 'Floor plan and space utilization',
		weight: 7,
		order: 2
	},
	{
		name: 'Kitchen',
		description: 'Kitchen quality and functionality',
		weight: 7,
		order: 3
	},
	{
		name: 'Bathrooms',
		description: 'Bathroom quality and quantity',
		weight: 6,
		order: 4
	},
	{
		name: 'Outdoor Space',
		description: 'Yard, patio, and outdoor amenities',
		weight: 6,
		order: 5
	},
	{
		name: 'Storage',
		description: 'Closets, garage, attic space',
		weight: 5,
		order: 6
	},
	{
		name: 'Natural Light',
		description: 'Windows and brightness',
		weight: 5,
		order: 7
	}
];
