import { z } from 'zod';

const currentYear = new Date().getFullYear();

export const houseFormSchema = z.object({
	// Required address fields
	address: z.string().min(1, 'Street address is required'),
	city: z.string().min(1, 'City is required'),
	state: z
		.string()
		.min(2, 'State must be at least 2 characters')
		.max(2, 'State must be 2 characters (e.g., CA)'),
	zipCode: z
		.string()
		.regex(/^\d{5}$/, 'ZIP code must be exactly 5 digits')
		.length(5, 'ZIP code must be exactly 5 digits'),

	// Optional numeric fields
	price: z
		.number()
		.positive('Price must be positive')
		.int('Price must be a whole number')
		.nullable(),

	squareFeet: z
		.number()
		.positive('Square feet must be positive')
		.int('Square feet must be a whole number')
		.nullable(),

	lotSize: z
		.number()
		.positive('Lot size must be positive')
		.int('Lot size must be a whole number')
		.nullable(),

	bedrooms: z
		.number()
		.int('Bedrooms must be a whole number')
		.min(0, 'Bedrooms cannot be negative')
		.nullable(),

	bathrooms: z.number().min(0, 'Bathrooms cannot be negative').nullable(),

	yearBuilt: z
		.number()
		.int('Year built must be a whole number')
		.min(1800, 'Year built must be 1800 or later')
		.max(currentYear, `Year built cannot be later than ${currentYear}`)
		.nullable(),

	// Optional string fields
	listingUrl: z
		.string()
		.url('Must be a valid URL')
		.nullable()
		.transform((value) => (value === '' ? null : value)),

	notes: z
		.string()
		.nullable()
		.transform((value) => (value === '' ? null : value))
});

export type HouseFormSchema = z.infer<typeof houseFormSchema>;
