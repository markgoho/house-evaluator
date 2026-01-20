import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock SvelteKit runtime modules
vi.mock('$app/environment', () => ({
	browser: false,
	building: false,
	dev: true,
	version: 'test'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidate: vi.fn(),
	invalidateAll: vi.fn(),
	preloadData: vi.fn(),
	preloadCode: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	pushState: vi.fn(),
	replaceState: vi.fn()
}));

vi.mock('$app/state', () => ({
	page: {
		url: new URL('http://localhost:3000'),
		params: {},
		route: { id: null },
		status: 200,
		error: null,
		data: {},
		form: undefined,
		state: {}
	}
}));
