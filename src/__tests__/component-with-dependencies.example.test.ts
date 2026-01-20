/**
 * EXAMPLE: Testing a Svelte component that uses services and stores
 *
 * This demonstrates the Svelte equivalent of Angular's TestBed provider mocking
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { readable } from 'svelte/store';

describe('Component with Dependencies - Mocking Pattern', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('example: mocking stores before component render', async () => {
		// STEP 1: Mock the store module BEFORE importing component
		vi.mock('$lib/stores/houses-store', () => ({
			housesStore: readable({
				houses: [
					{
						id: 'house-1',
						address: '123 Test St',
						city: 'San Francisco',
						state: 'CA',
						zipCode: '94102',
						price: 500000,
						photoUrls: []
					}
				],
				loading: false,
				error: null
			})
		}));

		// STEP 2: Mock any service functions the component might call
		vi.mock('$lib/services/house-service', () => ({
			getHouse: vi.fn().mockResolvedValue({
				id: 'house-1',
				address: '123 Test St'
			}),
			deleteHouse: vi.fn().mockResolvedValue(undefined)
		}));

		// STEP 3: Now import and render the component
		// It will use mocked versions of housesStore and house-service

		// In a real test, you'd import your component here:
		// const HousesPage = await import('$lib/routes/houses/+page.svelte');
		// render(HousesPage.default);

		// For this example, we'll just verify mocks work
		const { housesStore } = await import('$lib/stores/houses-store');
		const { getHouse } = await import('$lib/services/house-service');

		// Verify store returns mocked data
		const storeValue = await new Promise((resolve) => {
			const unsubscribe = housesStore.subscribe((value) => {
				resolve(value);
				unsubscribe();
			});
		});

		expect(storeValue).toHaveProperty('houses');
		expect((storeValue as any).houses).toHaveLength(1);

		// Verify service function is mocked (note: actual signature is two params)
		await getHouse('fam-1', 'house-1');
		expect(getHouse).toHaveBeenCalledWith('fam-1', 'house-1');
	});

	it('example: inline mocking with spyOn', async () => {
		// Import the real module first
		const houseService = await import('$lib/services/house-service');

		// Spy on specific functions
		const getHouseSpy = vi.spyOn(houseService, 'getHouse').mockResolvedValue({
			id: 'house-1',
			address: 'Mocked Address',
			city: 'Mock City',
			state: 'CA',
			zipCode: '12345',
			price: 999999
		} as any);

		// Now when component calls getHouse, it gets the mock
		const result = await houseService.getHouse('fam-1', 'house-1');

		expect(result?.address).toBe('Mocked Address');
		expect(getHouseSpy).toHaveBeenCalledTimes(1);

		// Can verify call arguments
		expect(getHouseSpy).toHaveBeenCalledWith('fam-1', 'house-1');

		// Clean up
		getHouseSpy.mockRestore();
	});

	it('example: mocking Firebase directly', async () => {
		// Mock Firebase Firestore functions
		const mockGetDoc = vi.fn().mockResolvedValue({
			exists: () => true,
			data: () => ({
				address: '123 Firebase St',
				city: 'Cloud City',
				price: 750000
			}),
			id: 'house-1'
		});

		vi.mock('firebase/firestore', () => ({
			getDoc: mockGetDoc,
			doc: vi.fn((db, path) => ({ path })),
			collection: vi.fn(),
			getFirestore: vi.fn()
		}));

		// Now service functions will use mocked Firebase
		expect(mockGetDoc).toBeDefined();
	});
});
