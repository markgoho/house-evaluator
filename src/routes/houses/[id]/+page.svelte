<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { authStore } from '$lib/stores/auth-store';
	import { getHouse, deleteHouse } from '$lib/services/house-service';
	import { getRatingsForHouse } from '$lib/services/rating-service';
	import type { House, Rating } from '$lib/types';

	let house = $state<House | null>(null);
	let ratings = $state<Rating[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const houseId = $derived($page.params.id);
	const averageScore = $derived(
		ratings.length > 0
			? Math.round((ratings.reduce((sum, r) => sum + r.overallScore, 0) / ratings.length) * 10) / 10
			: 0
	);

	onMount(async () => {
		await loadHouse();
	});

	async function loadHouse() {
		if (!$userProfileStore.profile?.familyId || !houseId) {
			error = 'No family ID or house ID found';
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
			<div class="loading">Loading house details...</div>
		{:else if error || !house}
			<div class="error">{error ?? 'House not found'}</div>
		{:else}
			<div class="page-header">
				<div class="header-content">
					<h1>{house.address}</h1>
					<p class="location">{house.city}, {house.state} {house.zipCode}</p>
				</div>
				<div class="header-actions">
					<a href={`/houses/${houseId}/rate`} class="btn-primary">Rate This House</a>
					<a href={`/houses/${houseId}/edit`} class="btn-secondary">Edit</a>
					<button onclick={handleDelete} class="btn-danger">Delete</button>
				</div>
			</div>

			<div class="content-grid">
				<!-- Photo Gallery -->
				{#if house.photoUrls.length > 0}
					<div class="photos-section card">
						<div class="photos-grid">
							{#each house.photoUrls as photoUrl}
								<img src={photoUrl} alt={house.address} class="photo" />
							{/each}
						</div>
					</div>
				{/if}

				<!-- Property Details -->
				<div class="details-section card">
					<h2>Property Details</h2>
					<div class="details-grid">
						{#if house.price}
							<div class="detail-item">
								<span class="detail-label">Price</span>
								<span class="detail-value">${house.price.toLocaleString()}</span>
							</div>
						{/if}
						{#if house.pricePerSqFt}
							<div class="detail-item">
								<span class="detail-label">Price per Sq Ft</span>
								<span class="detail-value">${house.pricePerSqFt}</span>
							</div>
						{/if}
						{#if house.bedrooms}
							<div class="detail-item">
								<span class="detail-label">Bedrooms</span>
								<span class="detail-value">{house.bedrooms}</span>
							</div>
						{/if}
						{#if house.bathrooms}
							<div class="detail-item">
								<span class="detail-label">Bathrooms</span>
								<span class="detail-value">{house.bathrooms}</span>
							</div>
						{/if}
						{#if house.squareFeet}
							<div class="detail-item">
								<span class="detail-label">Square Feet</span>
								<span class="detail-value">{house.squareFeet.toLocaleString()}</span>
							</div>
						{/if}
						{#if house.lotSize}
							<div class="detail-item">
								<span class="detail-label">Lot Size</span>
								<span class="detail-value">{house.lotSize.toLocaleString()} sq ft</span>
							</div>
						{/if}
						{#if house.yearBuilt}
							<div class="detail-item">
								<span class="detail-label">Year Built</span>
								<span class="detail-value">{house.yearBuilt}</span>
							</div>
						{/if}
					</div>

					{#if house.listingUrl}
						<a href={house.listingUrl} target="_blank" rel="noopener noreferrer" class="listing-link">
							View Original Listing →
						</a>
					{/if}

					{#if house.notes}
						<div class="notes">
							<h3>Notes</h3>
							<p>{house.notes}</p>
						</div>
					{/if}
				</div>

				<!-- Ratings Summary -->
				<div class="ratings-section card">
					<h2>Ratings</h2>
					{#if ratings.length === 0}
						<p class="no-ratings">No ratings yet. Be the first to rate this house!</p>
						<a href={`/houses/${houseId}/rate`} class="btn-primary">Rate Now</a>
					{:else}
						<div class="average-score">
							<div class="score-circle">
								<span class="score">{averageScore}</span>
								<span class="score-label">/ 10</span>
							</div>
							<p class="score-description">
								Average score from {ratings.length} rating{ratings.length === 1 ? '' : 's'}
							</p>
						</div>

						<div class="individual-ratings">
							<h3>Individual Ratings</h3>
							{#each ratings as rating}
								<div class="rating-item">
									<div class="rating-header">
										{#if rating.userPhotoUrl}
											<img src={rating.userPhotoUrl} alt={rating.userName} class="user-avatar" />
										{/if}
										<div class="rating-info">
											<span class="user-name">{rating.userName}</span>
											<span class="rating-score">{rating.overallScore} / 10</span>
										</div>
									</div>
									{#if rating.comments}
										<p class="rating-comments">{rating.comments}</p>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.house-detail-page {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
	}

	.page-header {
		margin-bottom: var(--spacing-xl);
	}

	.header-content h1 {
		font-size: var(--font-size-2xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.location {
		color: var(--color-text-secondary);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.btn-primary,
	.btn-secondary,
	.btn-danger {
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-base);
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}

	.btn-secondary {
		background: white;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-surface);
	}

	.btn-danger {
		background: white;
		color: var(--color-error);
		border: 1px solid var(--color-error);
	}

	.btn-danger:hover {
		background: var(--color-error);
		color: white;
	}

	.content-grid {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}

	.card h2 {
		font-size: var(--font-size-xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
		padding-bottom: var(--spacing-sm);
		border-bottom: 1px solid var(--color-border);
	}

	.card h3 {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}

	.photo {
		width: 100%;
		height: 200px;
		object-fit: cover;
		border-radius: var(--radius-md);
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.detail-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.detail-value {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.listing-link {
		display: inline-block;
		color: var(--color-primary);
		font-weight: 500;
		margin-top: var(--spacing-md);
	}

	.notes {
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.average-score {
		text-align: center;
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-lg);
	}

	.score-circle {
		display: inline-block;
		margin-bottom: var(--spacing-sm);
	}

	.score {
		font-size: 3rem;
		font-weight: 700;
		color: var(--color-primary);
	}

	.score-label {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
	}

	.score-description {
		color: var(--color-text-secondary);
	}

	.no-ratings {
		text-align: center;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.individual-ratings {
		margin-top: var(--spacing-lg);
	}

	.rating-item {
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
	}

	.rating-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}

	.rating-info {
		display: flex;
		justify-content: space-between;
		flex: 1;
		align-items: center;
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.rating-score {
		font-weight: 600;
		color: var(--color-primary);
	}

	.rating-comments {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	@media (max-width: 768px) {
		.house-detail-page {
			padding: var(--spacing-md);
		}

		.header-actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary,
		.btn-danger {
			width: 100%;
			text-align: center;
		}
	}
</style>
