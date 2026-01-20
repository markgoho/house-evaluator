import { describe, it, expect, vi, beforeEach } from 'vitest';

// This shows how to mock dependencies when testing code that uses services

// Example: Testing a component or function that calls house-service
// We'll mock the Firebase dependencies

vi.mock('$lib/firebase/get-firestore-instance', () => ({
	getFirestoreInstance: vi.fn(() => ({
		collection: vi.fn(),
		doc: vi.fn()
	}))
}));

vi.mock('firebase/firestore', () => ({
	doc: vi.fn(),
	getDoc: vi.fn(),
	setDoc: vi.fn(),
	deleteDoc: vi.fn(),
	collection: vi.fn(),
	query: vi.fn(),
	where: vi.fn(),
	orderBy: vi.fn(),
	getDocs: vi.fn(),
	onSnapshot: vi.fn()
}));

describe('Service Mocking Example', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('demonstrates how to mock service calls', async () => {
		// Import the mocked modules
		const { getDoc } = await import('firebase/firestore');
		const { getFirestoreInstance } = await import('$lib/firebase/get-firestore-instance');

		// Setup mock return values
		vi.mocked(getDoc).mockResolvedValue({
			exists: () => true,
			data: () => ({
				id: 'house-1',
				address: '123 Main St',
				city: 'San Francisco',
				price: 500000
			}),
			id: 'house-1'
		} as any);

		// Now when getHouse is called, it will use mocked Firebase
		const { getHouse } = await import('$lib/services/house-service');

		const result = await getHouse('family-1', 'house-1');

		expect(result?.address).toBe('123 Main St');
		expect(getDoc).toHaveBeenCalledTimes(1);
	});

	it('demonstrates spying on specific functions', async () => {
		// You can also spy on non-mocked modules
		const houseService = await import('$lib/services/house-service');
		const getHouseSpy = vi.spyOn(houseService, 'getHouse');

		getHouseSpy.mockResolvedValue({
			id: 'house-1',
			address: 'Mocked House',
			city: 'Test City'
		} as any);

		const result = await houseService.getHouse('fam-1', 'house-1');

		expect(result?.address).toBe('Mocked House');
		expect(getHouseSpy).toHaveBeenCalledWith('fam-1', 'house-1');
	});
});
