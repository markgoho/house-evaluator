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
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading house details...</p>
			</div>
		{:else if error || !house}
			<div class="error-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="16" r="1" fill="currentColor"/>
				</svg>
				<p>{error ?? 'House not found'}</p>
				<a href="/houses" class="btn-secondary">Back to Houses</a>
			</div>
		{:else}
			<!-- Header Section -->
			<header class="page-header">
				<div class="header-content">
					<a href="/houses" class="back-link">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span>Back to Houses</span>
					</a>
					<h1>{house.address}</h1>
					<p class="location">{house.city}, {house.state} {house.zipCode}</p>
				</div>
				<div class="header-actions">
					<a href={`/houses/${houseId}/rate`} class="btn-primary">
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<span>Rate House</span>
					</a>
					<a href={`/houses/${houseId}/edit`} class="btn-secondary">Edit</a>
					<button onclick={handleDelete} class="btn-danger">Delete</button>
				</div>
			</header>

			<div class="content-grid">
				<!-- Property Details Card -->
				<section class="card details-card">
					<h2 class="card-title">Property Details</h2>
					<div class="details-grid">
						{#if house.price}
							<div class="detail-item featured">
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
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M15 3H21V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								<path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<span>View Original Listing</span>
						</a>
					{/if}

					{#if house.notes}
						<div class="notes-section">
							<h3>Notes</h3>
							<p>{house.notes}</p>
						</div>
					{/if}
				</section>

				<!-- Ratings Card -->
				<section class="card ratings-card">
					<h2 class="card-title">Ratings</h2>
					{#if ratings.length === 0}
						<div class="no-ratings">
							<div class="no-ratings-icon">
								<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</div>
							<p>No ratings yet</p>
							<span>Be the first to rate this house!</span>
							<a href={`/houses/${houseId}/rate`} class="btn-primary">Rate Now</a>
						</div>
					{:else}
						<div class="score-display">
							<div class="score-badge" class:positive={averageScore > 0} class:negative={averageScore < 0}>
								<span class="score-value">{averageScore > 0 ? '+' : ''}{averageScore}</span>
								<span class="score-max">/ 5</span>
							</div>
							<p class="score-meta">
								Average from {ratings.length} rating{ratings.length === 1 ? '' : 's'}
							</p>
						</div>

						<div class="ratings-list">
							<h3>Individual Ratings</h3>
							{#each ratings as rating}
								<div class="rating-item">
									<div class="rating-user">
										{#if rating.userPhotoUrl}
											<img src={rating.userPhotoUrl} alt={rating.userName} class="user-avatar" />
										{:else}
											<div class="avatar-placeholder">
												<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
													<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
													<circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
												</svg>
											</div>
										{/if}
										<span class="user-name">{rating.userName}</span>
									</div>
									<div class="rating-score" class:positive={rating.overallScore > 0} class:negative={rating.overallScore < 0}>
										{rating.overallScore > 0 ? '+' : ''}{rating.overallScore}
									</div>
								</div>
								{#if rating.comments}
									<p class="rating-comments">{rating.comments}</p>
								{/if}
							{/each}
						</div>
					{/if}
				</section>

				<!-- Photos Section -->
				{#if house.photoUrls.length > 0}
					<section class="card photos-card">
						<h2 class="card-title">Photos</h2>
						<div class="photos-grid">
							{#each house.photoUrls as photoUrl}
								<img src={photoUrl} alt={house.address} class="photo" />
							{/each}
						</div>
					</section>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.house-detail-page {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	/* Loading & Error States */
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

	/* Page Header */
	.page-header {
		margin-bottom: var(--spacing-xl);
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-decoration: none;
		margin-bottom: var(--spacing-md);
	}

	.back-link:hover {
		color: var(--color-primary);
	}

	.header-content h1 {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.location {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	/* Buttons */
	.btn-primary,
	.btn-secondary,
	.btn-danger {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--font-size-sm);
		border: 1px solid transparent;
		cursor: pointer;
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-primary);
	}

	.btn-secondary {
		background: var(--color-surface);
		color: var(--color-text-primary);
		border-color: var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-background);
		border-color: var(--color-primary);
	}

	.btn-danger {
		background: var(--color-surface);
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.btn-danger:hover {
		background: var(--color-error);
		color: white;
	}

	/* Content Grid */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-lg);
	}

	@media (min-width: 1024px) {
		.content-grid {
			grid-template-columns: 1fr 1fr;
		}

		.photos-card {
			grid-column: span 2;
		}
	}

	/* Cards */
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border-light);
		margin-bottom: var(--spacing-lg);
	}

	/* Details Grid */
	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.detail-item.featured {
		grid-column: span 2;
	}

	.detail-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-value {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.detail-item.featured .detail-value {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		color: var(--color-primary);
	}

	.listing-link {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		color: var(--color-primary);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.listing-link:hover {
		color: var(--color-primary-dark);
	}

	.notes-section {
		margin-top: var(--spacing-lg);
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border-light);
	}

	.notes-section h3 {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.notes-section p {
		color: var(--color-text-secondary);
		line-height: var(--leading-relaxed);
	}

	/* Ratings */
	.no-ratings {
		text-align: center;
		padding: var(--spacing-xl);
	}

	.no-ratings-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: var(--color-accent-subtle);
		color: var(--color-accent);
		border-radius: var(--radius-xl);
		margin: 0 auto var(--spacing-md);
	}

	.no-ratings p {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.no-ratings span {
		display: block;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.score-display {
		text-align: center;
		padding: var(--spacing-lg);
		background: var(--color-background);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.score-badge {
		display: inline-flex;
		align-items: baseline;
		gap: var(--spacing-xs);
	}

	.score-value {
		font-family: var(--font-display);
		font-size: var(--font-size-4xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.score-badge.positive .score-value {
		color: var(--color-success);
	}

	.score-badge.negative .score-value {
		color: var(--color-error);
	}

	.score-max {
		font-size: var(--font-size-lg);
		color: var(--color-text-muted);
	}

	.score-meta {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-sm);
	}

	.ratings-list h3 {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.rating-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		background: var(--color-background);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-sm);
	}

	.rating-user {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 36px;
		height: 36px;
		background: var(--color-border-light);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.rating-score {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.rating-score.positive {
		color: var(--color-success);
	}

	.rating-score.negative {
		color: var(--color-error);
	}

	.rating-comments {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		line-height: var(--leading-relaxed);
	}

	/* Photos Grid */
	.photos-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: var(--spacing-md);
	}

	.photo {
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: var(--radius-md);
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.house-detail-page {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}

		.header-actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary,
		.btn-danger {
			width: 100%;
			justify-content: center;
		}

		.details-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
