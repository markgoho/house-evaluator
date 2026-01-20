import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LoadingSpinner from './loading-spinner.svelte';

describe('LoadingSpinner', () => {
	it('shows default loading message to user', () => {
		render(LoadingSpinner);
		// User sees the loading message - that's what matters
		expect(screen.getByText('Loading...')).toBeVisible();
	});

	it('shows custom loading message to user', () => {
		render(LoadingSpinner, { props: { message: 'Loading houses...' } });
		// User sees their custom message
		expect(screen.getByText('Loading houses...')).toBeVisible();
	});
});
