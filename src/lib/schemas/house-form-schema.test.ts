import { describe, it, expect } from 'vitest';
import { houseFormSchema } from './house-form-schema';

describe('houseFormSchema', () => {
	describe('address validation', () => {
		it('accepts valid address data', () => {
			const validData = {
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			};

			const result = houseFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('rejects empty address', () => {
			const invalidData = {
				address: '',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			};

			const result = houseFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toBe('Street address is required');
			}
		});
	});

	describe('state validation', () => {
		it('rejects state with wrong length', () => {
			const invalidData = {
				address: '123 Main St',
				city: 'San Francisco',
				state: 'California',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			};

			const result = houseFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toContain('2 characters');
			}
		});
	});

	describe('zipCode validation', () => {
		it('rejects invalid ZIP codes', () => {
			const testCases = ['1234', '123456', 'abcde', '9410a'];

			for (const zipCode of testCases) {
				const result = houseFormSchema.safeParse({
					address: '123 Main St',
					city: 'San Francisco',
					state: 'CA',
					zipCode,
					price: null,
					squareFeet: null,
					lotSize: null,
					bedrooms: null,
					bathrooms: null,
					yearBuilt: null,
					listingUrl: null,
					notes: null
				});

				expect(result.success).toBe(false);
			}
		});

		it('accepts valid 5-digit ZIP code', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(true);
		});
	});

	describe('numeric field validation', () => {
		it('rejects negative price', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: -100,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues[0]?.message).toContain('positive');
			}
		});

		it('accepts valid price', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: 500000,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(true);
		});
	});

	describe('yearBuilt validation', () => {
		it('rejects year before 1800', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: 1799,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(false);
		});

		it('rejects future years', () => {
			const currentYear = new Date().getFullYear();
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: currentYear + 1,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(false);
		});
	});

	describe('listingUrl validation', () => {
		it('accepts null listingUrl', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: null,
				notes: null
			});

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.listingUrl).toBe(null);
			}
		});

		it('accepts valid URL', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: 'https://zillow.com/property/123',
				notes: null
			});

			expect(result.success).toBe(true);
		});

		it('rejects invalid URL format', () => {
			const result = houseFormSchema.safeParse({
				address: '123 Main St',
				city: 'San Francisco',
				state: 'CA',
				zipCode: '94102',
				price: null,
				squareFeet: null,
				lotSize: null,
				bedrooms: null,
				bathrooms: null,
				yearBuilt: null,
				listingUrl: 'not-a-valid-url',
				notes: null
			});

			expect(result.success).toBe(false);
		});
	});
});
