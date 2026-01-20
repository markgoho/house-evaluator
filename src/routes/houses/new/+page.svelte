<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { authStore } from '$lib/stores/auth-store';
	import { createHouse } from '$lib/services/house-service';
	import HouseForm from '$lib/components/HouseForm.svelte';
	import type { HouseFormData } from '$lib/types';
	import { ROUTES } from '$lib/constants';

	let loading = $state(false);
	let error = $state<string | null>(null);
	let sourceImageUrl = $state<string | undefined>(undefined);

	// Parse URL parameters from page state (reactive)
	const initialFormData = $derived.by(() => {
		const params = page.url.searchParams;

		// Build initial form data from URL params
		const formData: Partial<HouseFormData> = {};

		// String fields
		const addressParam = params.get('address');
		if (addressParam) formData.address = addressParam;

		const cityParam = params.get('city');
		if (cityParam) formData.city = cityParam;

		const stateParam = params.get('state');
		if (stateParam) formData.state = stateParam;

		const zipCodeParam = params.get('zipCode');
		if (zipCodeParam) formData.zipCode = zipCodeParam;

		const listingUrlParam = params.get('listingUrl');
		if (listingUrlParam) formData.listingUrl = listingUrlParam;

		const notesParam = params.get('notes');
		if (notesParam) formData.notes = notesParam;

		// Numeric fields - parse and validate
		const priceParam = params.get('price');
		if (priceParam) {
			const parsed = Number.parseInt(priceParam, 10);
			if (!Number.isNaN(parsed) && parsed > 0) formData.price = parsed;
		}

		const squareFeetParam = params.get('squareFeet');
		if (squareFeetParam) {
			const parsed = Number.parseInt(squareFeetParam, 10);
			if (!Number.isNaN(parsed) && parsed > 0) formData.squareFeet = parsed;
		}

		const bedroomsParam = params.get('bedrooms');
		if (bedroomsParam) {
			const parsed = Number.parseInt(bedroomsParam, 10);
			if (!Number.isNaN(parsed) && parsed >= 0) formData.bedrooms = parsed;
		}

		const bathroomsParam = params.get('bathrooms');
		if (bathroomsParam) {
			const parsed = Number.parseFloat(bathroomsParam);
			if (!Number.isNaN(parsed) && parsed >= 0) formData.bathrooms = parsed;
		}

		const yearBuiltParam = params.get('yearBuilt');
		if (yearBuiltParam) {
			const parsed = Number.parseInt(yearBuiltParam, 10);
			const currentYear = new Date().getFullYear();
			if (!Number.isNaN(parsed) && parsed >= 1800 && parsed <= currentYear) {
				formData.yearBuilt = parsed;
			}
		}

		const lotSizeParam = params.get('lotSize');
		if (lotSizeParam) {
			const parsed = Number.parseInt(lotSizeParam, 10);
			if (!Number.isNaN(parsed) && parsed > 0) formData.lotSize = parsed;
		}

		// Image URL from extension
		const imageUrlParam = params.get('imageUrl');
		if (imageUrlParam) {
			sourceImageUrl = imageUrlParam;
		}

		return formData;
	});

	async function handleSubmit(formData: HouseFormData) {
		if (!$userProfileStore.profile?.familyId) {
			error = 'No family ID found';
			return;
		}

		if (!$authStore.user) {
			error = 'Not authenticated';
			return;
		}

		loading = true;
		error = null;

		try {
			const houseId = await createHouse({
				data: {
					familyId: $userProfileStore.profile.familyId,
					...formData,
					photoUrls: [],
					createdBy: $authStore.user.uid
				},
				sourceImageUrl
			});
			goto(ROUTES.houseDetail(houseId));
		} catch (err) {
			console.error('Error creating house:', err);
			error = err instanceof Error ? err.message : 'Failed to create house';
		} finally {
			loading = false;
		}
	}
</script>

<div class="new-house-page">
	<div class="container">
		<div class="page-header">
			<h1>Add New House</h1>
			<a href={ROUTES.HOUSES} class="btn-secondary">Cancel</a>
		</div>

		<HouseForm
			initialData={initialFormData}
			submitButtonText="Add House"
			submitButtonLoadingText="Creating..."
			cancelUrl={ROUTES.HOUSES}
			isSubmitting={loading}
			errorMessage={error}
			{sourceImageUrl}
			onsubmit={handleSubmit}
		/>
	</div>
</div>

<style>
	.new-house-page {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
	}

	h1 {
		font-size: var(--font-size-2xl);
		color: var(--color-text-primary);
	}

	.btn-secondary {
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
		border: 1px solid var(--color-border);
		background: white;
		color: var(--color-text-primary);
	}

	.btn-secondary:hover {
		background: var(--color-surface);
	}

	@media (max-width: 768px) {
		.new-house-page {
			padding: var(--spacing-md);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}
	}
</style>
