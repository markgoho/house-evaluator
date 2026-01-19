<script lang="ts">
	import { housesStore } from '$lib/stores/houses-store';
	import { goto } from '$app/navigation';

	function navigateToHouse(houseId: string) {
		goto(`/houses/${houseId}`);
	}
</script>

<div class="houses-page">
	<div class="container">
		<header class="page-header">
			<div class="header-content">
				<h1>Houses</h1>
				<p class="header-subtitle">Properties you're considering</p>
			</div>
			<a href="/houses/new" class="btn-primary">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 5V19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
				<span>Add House</span>
			</a>
		</header>

		{#if $housesStore.loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading houses...</p>
			</div>
		{:else if $housesStore.error}
			<div class="error-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="16" r="1" fill="currentColor"/>
				</svg>
				<p>{$housesStore.error}</p>
			</div>
		{:else if $housesStore.houses.length === 0}
			<div class="empty-state">
				<div class="empty-illustration">
					<svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h2>No houses yet</h2>
				<p>Start by adding your first property to evaluate</p>
				<a href="/houses/new" class="btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 5V19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Add Your First House</span>
				</a>
			</div>
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

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
		gap: var(--spacing-md);
	}

	.header-content h1 {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.header-subtitle {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
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

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		color: var(--color-text-secondary);
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

	/* Error State */
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		color: var(--color-error);
		text-align: center;
	}

	.error-state svg {
		margin-bottom: var(--spacing-md);
		opacity: 0.6;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		text-align: center;
	}

	.empty-illustration {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 120px;
		height: 120px;
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-lg);
	}

	.empty-state h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
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
		margin-bottom: var(--spacing-md);
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

		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.btn-primary {
			justify-content: center;
		}

		.houses-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
