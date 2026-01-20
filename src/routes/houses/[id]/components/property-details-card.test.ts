import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PropertyDetailsCard from './property-details-card.svelte';
import type { House } from '$lib/types';

describe('PropertyDetailsCard', () => {
	const mockHouse: House = {
		id: 'house-1',
		familyId: 'family-1',
		address: '123 Main St',
		city: 'San Francisco',
		state: 'CA',
		zipCode: '94102',
		price: 500000,
		pricePerSqFt: 250,
		squareFeet: 2000,
		lotSize: 5000,
		bedrooms: 3,
		bathrooms: 2,
		yearBuilt: 1990,
		listingUrl: 'https://zillow.com/property/123',
		photoUrls: [],
		notes: 'Great location!',
		createdBy: 'user-1',
		createdAt: new Date(),
		updatedAt: new Date()
	};

	it('renders property price', () => {
		render(PropertyDetailsCard, { props: { house: mockHouse } });
		expect(screen.getByText('$500,000')).toBeVisible();
	});

	it('renders bedrooms and bathrooms', () => {
		render(PropertyDetailsCard, { props: { house: mockHouse } });
		expect(screen.getByText('3')).toBeVisible();
		expect(screen.getByText('2')).toBeVisible();
	});

	it('renders listing URL link', () => {
		render(PropertyDetailsCard, { props: { house: mockHouse } });
		const link = screen.getByRole('link', { name: /view original listing/i });
		expect(link).toBeVisible();
		expect(link).toHaveAttribute('href', 'https://zillow.com/property/123');
		expect(link).toHaveAttribute('target', '_blank');
	});

	it('renders notes section when present', () => {
		render(PropertyDetailsCard, { props: { house: mockHouse } });
		expect(screen.getByText('Great location!')).toBeVisible();
	});

	it('hides optional fields when null', () => {
		const houseWithoutOptionals: House = {
			...mockHouse,
			price: null,
			squareFeet: null,
			lotSize: null,
			bedrooms: null,
			bathrooms: null,
			yearBuilt: null,
			listingUrl: null,
			notes: null
		};

		render(PropertyDetailsCard, { props: { house: houseWithoutOptionals } });

		expect(screen.queryByText('$500,000')).not.toBeInTheDocument();
		expect(screen.queryByText(/view original listing/i)).not.toBeInTheDocument();
		expect(screen.queryByText('Great location!')).not.toBeInTheDocument();
	});
});
