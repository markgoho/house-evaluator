import { z } from 'zod';
import { PROPERTY } from '$lib/constants';

export const houseFormSchema = z.object({
	// Required address fields
	address: z.string().min(1, 'Street address is required'),
	city: z.string().min(1, 'City is required'),
	state: z
		.string()
		.min(PROPERTY.STATE_CODE_LENGTH, 'State must be at least 2 characters')
		.max(PROPERTY.STATE_CODE_LENGTH, 'State must be 2 characters (e.g., CA)'),
	zipCode: z
		.string()
		.regex(PROPERTY.ZIP_CODE_PATTERN, 'ZIP code must be exactly 5 digits')
		.length(PROPERTY.ZIP_CODE_LENGTH, 'ZIP code must be exactly 5 digits'),

	// Optional numeric fields
	price: z
		.number()
		.min(PROPERTY.MIN_PRICE, 'Price must be positive')
		.int('Price must be a whole number')
		.nullable(),

	squareFeet: z
		.number()
		.min(PROPERTY.MIN_SQUARE_FEET, 'Square feet must be positive')
		.int('Square feet must be a whole number')
		.nullable(),

	lotSize: z
		.number()
		.min(PROPERTY.MIN_LOT_SIZE, 'Lot size must be positive')
		.int('Lot size must be a whole number')
		.nullable(),

	bedrooms: z
		.number()
		.int('Bedrooms must be a whole number')
		.min(PROPERTY.MIN_BEDROOMS, 'Bedrooms cannot be negative')
		.nullable(),

	bathrooms: z.number().min(PROPERTY.MIN_BATHROOMS, 'Bathrooms cannot be negative').nullable(),

	yearBuilt: z
		.number()
		.int('Year built must be a whole number')
		.min(PROPERTY.MIN_YEAR_BUILT, 'Year built must be 1800 or later')
		.max(PROPERTY.MAX_YEAR_BUILT, `Year built cannot be later than ${PROPERTY.MAX_YEAR_BUILT}`)
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
