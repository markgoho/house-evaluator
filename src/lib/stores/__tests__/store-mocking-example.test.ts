import { describe, it, expect, vi } from 'vitest';
import { readable } from 'svelte/store';

// Example: How to mock Svelte stores in component tests

describe('Store Mocking Patterns', () => {
	it('demonstrates mocking a store module', async () => {
		// Mock the entire store module
		vi.mock('$lib/stores/houses-store', () => ({
			housesStore: readable({
				houses: [
					{ id: '1', address: '123 Main St' },
					{ id: '2', address: '456 Oak Ave' }
				],
				loading: false,
				error: null
			})
		}));

		// Now when components import housesStore, they get the mock
		const { housesStore } = await import('$lib/stores/houses-store');

		const storeValue = await new Promise((resolve) => {
			const unsubscribe = housesStore.subscribe((value) => {
				resolve(value);
				unsubscribe();
			});
		});

		expect(storeValue).toEqual({
			houses: [
				{ id: '1', address: '123 Main St' },
				{ id: '2', address: '456 Oak Ave' }
			],
			loading: false,
			error: null
		});
	});

	it('demonstrates creating a mock store inline', () => {
		// Create a mock store for testing
		const mockAuthStore = readable({
			user: { uid: 'user-123', email: 'test@example.com' },
			loading: false,
			initialized: true
		});

		// Use this in component rendering
		let storeValue: any;
		const unsubscribe = mockAuthStore.subscribe((value) => {
			storeValue = value;
		});

		expect(storeValue.user?.uid).toBe('user-123');
		unsubscribe();
	});

	it('demonstrates mocking store with writable for state changes', async () => {
		const { writable } = await import('svelte/store');

		// Writable store allows you to change values during test
		const mockStore = writable<{ loading: boolean; data: { id: string; name: string } | null }>({
			loading: true,
			data: null
		});

		// Simulate loading complete
		mockStore.set({
			loading: false,
			data: { id: '1', name: 'Test' }
		});

		const currentValue = await new Promise((resolve) => {
			const unsubscribe = mockStore.subscribe((value) => {
				resolve(value);
				unsubscribe();
			});
		});

		expect(currentValue).toEqual({
			loading: false,
			data: { id: '1', name: 'Test' }
		});
	});
});
