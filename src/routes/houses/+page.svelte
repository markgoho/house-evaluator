<script lang="ts">
	import { housesStore } from '$lib/stores/houses-store';
	import { userProfileReady } from '$lib/stores/user-profile-store';
	import { goto } from '$app/navigation';
	import { LoadingSpinner, EmptyState, ErrorState, PageHeader } from '$lib/components/ui';
	import { ROUTES, RATING } from '$lib/constants';
	import { getRatingsForFamily } from '$lib/services/get-ratings-for-family';
	import type { Rating } from '$lib/types';

	let ratings = $state<Rating[]>([]);
	let ratingsLoaded = $state(false);

	const averageScores = $derived.by(() => {
		const scores = new Map<string, number>();
		const groups = new Map<string, number[]>();

		for (const rating of ratings) {
			const existing = groups.get(rating.houseId);
			if (existing) {
				existing.push(rating.overallScore);
			} else {
				groups.set(rating.houseId, [rating.overallScore]);
			}
		}

		for (const [houseId, houseScores] of groups) {
			const average =
				Math.round(
					(houseScores.reduce((sum, score) => sum + score, 0) / houseScores.length) * 10
				) / 10;
			scores.set(houseId, average);
		}

		return scores;
	});

	$effect(() => {
		const familyId = $userProfileReady.profile?.familyId;
		if (familyId) {
			getRatingsForFamily(familyId).then((result) => {
				ratings = result;
				ratingsLoaded = true;
			});
		}
	});

	function navigateToHouse(houseId: string) {
		goto(ROUTES.houseDetail(houseId));
	}
</script>

<div class="houses-page">
	<div class="container">
		<PageHeader title="Houses" subtitle="Properties you're considering">
			{#snippet action()}
				<a href={ROUTES.HOUSES_NEW} class="btn-primary">
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 5V19"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M5 12H19"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span>Add House</span>
				</a>
			{/snippet}
		</PageHeader>

		{#if $housesStore.loading}
			<LoadingSpinner message="Loading houses..." />
		{:else if $housesStore.error}
			<ErrorState message={$housesStore.error} />
		{:else if $housesStore.houses.length === 0}
			<EmptyState title="No houses yet" description="Start by adding your first property to evaluate">
				{#snippet icon()}
					<svg
						width="80"
						height="80"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M9 21V12H15V21"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{/snippet}
				{#snippet action()}
					<a href={ROUTES.HOUSES_NEW} class="btn-primary">
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M12 5V19"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
							<path
								d="M5 12H19"
								stroke="currentColor"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							/>
						</svg>
						<span>Add Your First House</span>
					</a>
				{/snippet}
			</EmptyState>
		{:else}
			<div class="houses-grid">
				{#each $housesStore.houses as house (house.id)}
					<button class="house-card" onclick={() => navigateToHouse(house.id)}>
						<div class="house-image-container">
							{#if house.photoUrls.length > 0}
								<img src={house.photoUrls[0]} alt={house.address} class="house-image" />
							{:else}
								<div class="house-image-placeholder">
									<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
										<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
									</svg>
								</div>
							{/if}
						</div>

						<div class="house-content">
							<h3 class="house-address">{house.address}</h3>
							<p class="house-location">{house.city}, {house.state} {house.zipCode}</p>

							{#if averageScores.has(house.id)}
								{@const score = averageScores.get(house.id)}
								<div class="house-rating">
									<span
										class="rating-badge"
										class:score-low={score !== undefined && score < 2}
										class:score-mid={score !== undefined && score >= 2 && score < 4}
										class:score-high={score !== undefined && score >= 4}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
											<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
										</svg>
										{score} / {RATING.MAX}
									</span>
								</div>
							{:else if ratingsLoaded}
								<div class="house-rating">
									<span class="rating-badge no-rating">Not rated</span>
								</div>
							{/if}

							<div class="house-details">
								{#if house.price}
									<div class="detail-item featured">
										<span class="detail-value">${house.price.toLocaleString()}</span>
									</div>
								{/if}
								<div class="detail-row">
									{#if house.bedrooms || house.bathrooms}
										<div class="detail-item">
											<span class="detail-label">Bed / Bath</span>
											<span class="detail-value">{house.bedrooms ?? '?'} / {house.bathrooms ?? '?'}</span>
										</div>
									{/if}
								{#if house.squareFeet}
									<div class="detail-item">
										<span class="detail-label">Sq Ft</span>
										<span class="detail-value">{house.squareFeet.toLocaleString()}</span>
									</div>
								{/if}
								{#if house.price && house.squareFeet}
									<div class="detail-item">
										<span class="detail-label">$/Sq Ft</span>
										<span class="detail-value">${Math.round(house.price / house.squareFeet).toLocaleString()}</span>
									</div>
								{/if}
								</div>
							</div>
						</div>

						<div class="card-arrow">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.houses-page {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--font-size-sm);
		border: none;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-primary);
	}

	/* Houses Grid */
	.houses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
		gap: var(--spacing-lg);
	}

	.house-card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		overflow: hidden;
		cursor: pointer;
		text-align: left;
		width: 100%;
		position: relative;
	}

	.house-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.house-image-container {
		width: 100%;
		height: 200px;
		background: var(--color-background);
		overflow: hidden;
	}

	.house-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.house-image-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.house-content {
		padding: var(--spacing-lg);
		flex: 1;
	}

	.house-address {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.house-location {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-sm);
	}

	.house-rating {
		margin-bottom: var(--spacing-md);
	}

	.rating-badge {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--font-size-sm);
		font-weight: 600;
		padding: 2px var(--spacing-sm);
		border-radius: var(--radius-md);
		background: var(--color-background);
	}

	.rating-badge.score-low {
		color: var(--color-error);
	}

	.rating-badge.score-mid {
		color: var(--color-text-primary);
	}

	.rating-badge.score-high {
		color: var(--color-success);
	}

	.rating-badge.no-rating {
		color: var(--color-text-muted);
		font-weight: 400;
	}

	.house-details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.detail-row {
		display: flex;
		gap: var(--spacing-lg);
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.detail-item.featured .detail-value {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-primary);
	}

	.detail-label {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.detail-value {
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.card-arrow {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		width: 32px;
		height: 32px;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.house-card:hover .card-arrow {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: white;
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.houses-page {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}

		.btn-primary {
			justify-content: center;
		}

		.houses-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
