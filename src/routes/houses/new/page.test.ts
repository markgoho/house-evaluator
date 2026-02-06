import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { readable } from 'svelte/store';

const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost:3000/houses/new'),
	params: {},
	route: { id: '/houses/new' },
	status: 200,
	error: undefined,
	data: {},
	form: undefined,
	state: {}
}));

vi.mock('$app/state', () => ({
	page: mockPage
}));

vi.mock('$lib/stores/user-profile-store', () => ({
	userProfileStore: readable({
		profile: { familyId: 'family-1', role: 'owner' },
		loading: false,
		initialized: true
	})
}));

vi.mock('$lib/stores/auth-store', () => ({
	authStore: readable({
		user: { uid: 'user-1', email: 'test@example.com' },
		loading: false,
		initialized: true
	})
}));

vi.mock('$lib/services/house-service', () => ({
	createHouse: vi.fn().mockResolvedValue('house-123')
}));

function setPageUrl(url: string): void {
	mockPage.url = new URL(url);
}

describe('New House Page', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		setPageUrl('http://localhost:3000/houses/new');
	});

	describe('URL parameter parsing', () => {
		it('populates form fields from URL query parameters', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=123+Main+St&city=Rochester&state=NY&zipCode=14626&price=350000&bedrooms=4&bathrooms=2.5&squareFeet=2000&yearBuilt=1990'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByLabelText(/street address/i)).toHaveValue('123 Main St');
			expect(screen.getByLabelText(/^city/i)).toHaveValue('Rochester');
			expect(screen.getByLabelText(/^state/i)).toHaveValue('NY');
			expect(screen.getByLabelText(/zip code/i)).toHaveValue('14626');
			expect(screen.getByLabelText(/price/i)).toHaveValue(350_000);
			expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(4);
			expect(screen.getByLabelText(/bathrooms/i)).toHaveValue(2.5);
			expect(screen.getByLabelText(/square feet/i)).toHaveValue(2000);
			expect(screen.getByLabelText(/year built/i)).toHaveValue(1990);
		});

		it('populates listing URL from query parameters', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=Test&city=Test&state=NY&zipCode=12345&listingUrl=https%3A%2F%2Fzillow.com%2Fproperty%2F123'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByLabelText(/listing url/i)).toHaveValue(
				'https://zillow.com/property/123'
			);
		});

		it('shows image preview when imageUrl parameter is provided', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=Test&city=Test&state=NY&zipCode=12345&imageUrl=https%3A%2F%2Fphotos.example.com%2Fhouse.jpg'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			const image = screen.getByAltText('Property preview');
			expect(image).toBeVisible();
			expect(image).toHaveAttribute('src', 'https://photos.example.com/house.jpg');
			expect(screen.getByText(/this image will be uploaded/i)).toBeVisible();
		});

		it('does not show image preview when imageUrl parameter is absent', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=Test&city=Test&state=NY&zipCode=12345'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.queryByAltText('Property preview')).not.toBeInTheDocument();
		});

		it('ignores invalid numeric parameters', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=Test&city=Test&state=NY&zipCode=12345&price=notanumber&bedrooms=-1&yearBuilt=1700'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByLabelText(/price/i)).not.toHaveValue(Number.NaN);
			expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(null);
			expect(screen.getByLabelText(/year built/i)).toHaveValue(null);
		});

		it('renders empty form when no URL parameters provided', async () => {
			setPageUrl('http://localhost:3000/houses/new');

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByLabelText(/street address/i)).toHaveValue('');
			expect(screen.getByLabelText(/^city/i)).toHaveValue('');
			expect(screen.getByLabelText(/^state/i)).toHaveValue('');
			expect(screen.getByLabelText(/zip code/i)).toHaveValue('');
			expect(screen.getByLabelText(/price/i)).toHaveValue(null);
			expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(null);
		});
	});

	describe('page structure', () => {
		it('shows page heading and cancel link', async () => {
			setPageUrl('http://localhost:3000/houses/new');

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByRole('heading', { name: 'Add New House' })).toBeVisible();
			const cancelLinks = screen.getAllByRole('link', { name: /cancel/i });
			expect(cancelLinks.length).toBeGreaterThanOrEqual(1);
			expect(cancelLinks[0]).toHaveAttribute('href', '/houses');
		});

		it('shows Add House submit button', async () => {
			setPageUrl('http://localhost:3000/houses/new');

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByRole('button', { name: 'Add House' })).toBeVisible();
		});
	});

	describe('browser extension integration (full URL)', () => {
		it('populates all fields from a Zillow extension URL', async () => {
			setPageUrl(
				'http://localhost:3000/houses/new?address=171+Mill+Run+Dr&city=Rochester&state=NY&zipCode=14626&price=349900&bedrooms=4&bathrooms=3&squareFeet=2186&yearBuilt=1987&listingUrl=https%3A%2F%2Fwww.zillow.com%2Fhomedetails%2F171-Mill-Run-Dr-Rochester-NY-14626%2F30938541_zpid%2F&imageUrl=https%3A%2F%2Fphotos.zillowstatic.com%2Ffp%2F786c67f90e24b8f56654f93af624df74-cc_ft_960.jpg'
			);

			const NewHousePage = await import('./+page.svelte');
			render(NewHousePage.default);

			expect(screen.getByLabelText(/street address/i)).toHaveValue('171 Mill Run Dr');
			expect(screen.getByLabelText(/^city/i)).toHaveValue('Rochester');
			expect(screen.getByLabelText(/^state/i)).toHaveValue('NY');
			expect(screen.getByLabelText(/zip code/i)).toHaveValue('14626');
			expect(screen.getByLabelText(/price/i)).toHaveValue(349_900);
			expect(screen.getByLabelText(/bedrooms/i)).toHaveValue(4);
			expect(screen.getByLabelText(/bathrooms/i)).toHaveValue(3);
			expect(screen.getByLabelText(/square feet/i)).toHaveValue(2186);
			expect(screen.getByLabelText(/year built/i)).toHaveValue(1987);
			expect(screen.getByLabelText(/listing url/i)).toHaveValue(
				'https://www.zillow.com/homedetails/171-Mill-Run-Dr-Rochester-NY-14626/30938541_zpid/'
			);

			const image = screen.getByAltText('Property preview');
			expect(image).toBeVisible();
			expect(image).toHaveAttribute(
				'src',
				'https://photos.zillowstatic.com/fp/786c67f90e24b8f56654f93af624df74-cc_ft_960.jpg'
			);
		});
	});
});
