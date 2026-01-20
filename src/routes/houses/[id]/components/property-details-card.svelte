<script lang="ts">
	import type { House } from '$lib/types';

	let { house }: { house: House } = $props();
</script>

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
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M18 13V19C18 19.5304 17.7893 20.0391 17.4142 20.4142C17.0391 20.7893 16.5304 21 16 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V8C3 7.46957 3.21071 6.96086 3.58579 6.58579C3.96086 6.21071 4.46957 6 5 6H11"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M15 3H21V9"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M10 14L21 3"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
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

<style>
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

	@media (max-width: 767px) {
		.details-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
