import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PageHeader from './page-header.svelte';

describe('PageHeader', () => {
	it('shows page title to user', () => {
		render(PageHeader, {
			props: {
				title: 'Houses',
				subtitle: 'Properties you are considering'
			}
		});

		// User sees the heading - use semantic queries
		expect(screen.getByRole('heading', { name: 'Houses' })).toBeVisible();
		expect(screen.getByText('Properties you are considering')).toBeVisible();
	});

	it('shows title without subtitle when not provided', () => {
		render(PageHeader, {
			props: {
				title: 'Dashboard'
			}
		});

		expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
		// Subtitle should not be visible to user
		expect(screen.queryByText(/properties/i)).not.toBeInTheDocument();
	});
});
