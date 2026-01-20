import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ErrorState from './error-state.svelte';

describe('ErrorState', () => {
	it('shows error message to user', () => {
		render(ErrorState, { props: { message: 'Something went wrong' } });
		// User sees and reads the error message
		expect(screen.getByText('Something went wrong')).toBeVisible();
	});

	it('shows different error messages', () => {
		render(ErrorState, { props: { message: 'Network connection failed' } });
		expect(screen.getByText('Network connection failed')).toBeVisible();
	});
});
