<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { authStore } from '$lib/stores/auth-store';
	import { getHouse, deleteHouse } from '$lib/services/house-service';
	import { getRatingsForHouse } from '$lib/services/rating-service';
	import type { House, Rating } from '$lib/types';
	import { LoadingSpinner, ErrorState } from '$lib/components/ui';
	import HouseDetailHeader from './components/house-detail-header.svelte';
	import PropertyDetailsCard from './components/property-details-card.svelte';
	import RatingsCard from './components/ratings-card.svelte';
	import PhotosCard from './components/photos-card.svelte';

	let house = $state<House | null>(null);
	let ratings = $state<Rating[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const houseId = $derived(page.params.id ?? '');
	const averageScore = $derived(
		ratings.length > 0
			? Math.round((ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length) * 10) / 10
			: 0
	);

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
		console.log('User profile store state:', {
			initialized: $userProfileStore.initialized,
			profile: $userProfileStore.profile,
			familyId: $userProfileStore.profile?.familyId,
			houseId
		});
		console.log('Current auth UID:', $authStore.user?.uid);

		if (!$userProfileStore.profile?.familyId || !houseId) {
			error = `No family ID or house ID found. Profile: ${JSON.stringify($userProfileStore.profile)}, House ID: ${houseId}`;
			loading = false;
			return;
		}

		try {
			const [houseData, ratingsData] = await Promise.all([
				getHouse($userProfileStore.profile.familyId, houseId),
				getRatingsForHouse($userProfileStore.profile.familyId, houseId)
			]);

			house = houseData;
			ratings = ratingsData;
			loading = false;
		} catch (err) {
			console.error('Error loading house:', err);
			error = err instanceof Error ? err.message : 'Failed to load house';
			loading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this house? This action cannot be undone.')) {
			return;
		}

		if (!$userProfileStore.profile?.familyId || !houseId) return;

		try {
			await deleteHouse($userProfileStore.profile.familyId, houseId);
			window.location.href = '/houses';
		} catch (err) {
			console.error('Error deleting house:', err);
			alert('Failed to delete house');
		}
	}
</script>

<div class="house-detail-page">
	<div class="container">
		{#if loading}
			<LoadingSpinner message="Loading house details..." />
		{:else if error || !house}
			<ErrorState message={error ?? 'House not found'} />
			<div class="error-actions">
				<a href="/houses" class="btn-secondary">Back to Houses</a>
			</div>
		{:else}
			<HouseDetailHeader {house} {houseId} ondelete={handleDelete} />

			<div class="content-grid">
				<PropertyDetailsCard {house} />
				<RatingsCard {ratings} {averageScore} {houseId} />
				<PhotosCard photoUrls={house.photoUrls} address={house.address} />
			</div>
		{/if}
	</div>
</div>

<style>
	.house-detail-page {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	.error-actions {
		display: flex;
		justify-content: center;
		margin-top: var(--spacing-lg);
	}

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--font-size-sm);
		background: var(--color-surface);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-background);
		border-color: var(--color-primary);
	}

	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-lg);
	}

	@media (min-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr 1fr;
		}

		.content-grid :global(.photos-card) {
			grid-column: span 2;
		}
	}

	@media (max-width: 767px) {
		.house-detail-page {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}
	}
</style>
