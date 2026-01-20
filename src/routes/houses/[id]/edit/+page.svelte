<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { getHouse, updateHouse } from '$lib/services/house-service';
	import HouseForm from '$lib/components/HouseForm.svelte';
	import type { House, HouseFormData } from '$lib/types';

	let house = $state<House | null>(null);
	let loading = $state(true);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const houseId = $derived(page.params.id);

	onMount(async () => {
		if (!$userProfileStore.initialized) {
			const unsubscribe = userProfileStore.subscribe((state) => {
				if (state.initialized) {
					unsubscribe();
					loadHouse();
				}
			});
		} else {
			await loadHouse();
		}
	});

	async function loadHouse() {
		if (!$userProfileStore.profile?.familyId || !houseId) {
			error = 'No family ID or house ID found';
			loading = false;
			return;
		}

		try {
			const houseData = await getHouse($userProfileStore.profile.familyId, houseId);

			if (!houseData) {
				error = 'House not found';
				loading = false;
				return;
			}

			house = houseData;
			loading = false;
		} catch (err) {
			console.error('Error loading house:', err);
			error = err instanceof Error ? err.message : 'Failed to load house';
			loading = false;
		}
	}

	async function handleSubmit(formData: HouseFormData) {
		if (!$userProfileStore.profile?.familyId || !houseId) {
			error = 'No family ID or house ID found';
			return;
		}

		saving = true;
		error = null;

		try {
			await updateHouse($userProfileStore.profile.familyId, houseId, formData);
			goto(`/houses/${houseId}`);
		} catch (err) {
			console.error('Error updating house:', err);
			error = err instanceof Error ? err.message : 'Failed to update house';
		} finally {
			saving = false;
		}
	}
</script>

<div class="edit-house-page">
	<div class="container">
		{#if loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading house details...</p>
			</div>
		{:else if error && !house}
			<div class="error-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="16" r="1" fill="currentColor"/>
				</svg>
				<p>{error}</p>
				<a href="/houses" class="btn-secondary">Back to Houses</a>
			</div>
		{:else if house}
			<div class="page-header">
				<h1>Edit House</h1>
				<a href={`/houses/${houseId}`} class="btn-secondary">Cancel</a>
			</div>

			<HouseForm
				initialData={{
					address: house.address,
					city: house.city,
					state: house.state,
					zipCode: house.zipCode,
					squareFeet: house.squareFeet,
					lotSize: house.lotSize,
					bedrooms: house.bedrooms,
					bathrooms: house.bathrooms,
					yearBuilt: house.yearBuilt,
					price: house.price,
					listingUrl: house.listingUrl ?? '',
					notes: house.notes ?? ''
				}}
				submitButtonText="Save Changes"
				submitButtonLoadingText="Saving..."
				cancelUrl={`/houses/${houseId}`}
				isSubmitting={saving}
				errorMessage={error}
				onsubmit={handleSubmit}
			/>
		{/if}
	</div>
</div>

<style>
	.edit-house-page {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		text-align: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.loading-state p,
	.error-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.error-state {
		color: var(--color-error);
	}

	.error-state svg {
		margin-bottom: var(--spacing-md);
		opacity: 0.6;
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
		.edit-house-page {
			padding: var(--spacing-md);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}
	}
</style>
