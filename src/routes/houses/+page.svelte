<script lang="ts">
	import { housesStore } from '$lib/stores/houses-store';
	import { goto } from '$app/navigation';

	function navigateToHouse(houseId: string) {
		goto(`/houses/${houseId}`);
	}
</script>

<div class="houses-page">
	<div class="container">
		<div class="page-header">
			<h1>Houses</h1>
			<a href="/houses/new" class="btn-primary">Add House</a>
		</div>

		{#if $housesStore.loading}
			<div class="loading">Loading houses...</div>
		{:else if $housesStore.error}
			<div class="error">{$housesStore.error}</div>
		{:else if $housesStore.houses.length === 0}
			<div class="empty-state">
				<div class="empty-icon">🏠</div>
				<h2>No houses yet</h2>
				<p>Start by adding your first property to evaluate</p>
				<a href="/houses/new" class="btn-primary">Add Your First House</a>
			</div>
		{:else}
			<div class="houses-grid">
				{#each $housesStore.houses as house (house.id)}
					<button class="house-card" onclick={() => navigateToHouse(house.id)}>
						{#if house.photoUrls.length > 0}
							<div class="house-image">
								<img src={house.photoUrls[0]} alt={house.address} />
							</div>
						{:else}
							<div class="house-image placeholder">
								<span class="placeholder-icon">🏠</span>
							</div>
						{/if}

						<div class="house-info">
							<h3>{house.address}</h3>
							<p class="location">{house.city}, {house.state} {house.zipCode}</p>

							<div class="house-details">
								{#if house.price}
									<div class="detail">
										<span class="detail-label">Price:</span>
										<span class="detail-value">${house.price.toLocaleString()}</span>
									</div>
								{/if}
								{#if house.bedrooms || house.bathrooms}
									<div class="detail">
										<span class="detail-label">Bed/Bath:</span>
										<span class="detail-value">{house.bedrooms ?? '?'} / {house.bathrooms ?? '?'}</span>
									</div>
								{/if}
								{#if house.squareFeet}
									<div class="detail">
										<span class="detail-label">Sq Ft:</span>
										<span class="detail-value">{house.squareFeet.toLocaleString()}</span>
									</div>
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.houses-page {
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

	.btn-primary {
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		transform: translateY(-1px);
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

	.empty-state {
		text-align: center;
		padding: var(--spacing-xl) * 2;
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-md);
	}

	.empty-state h2 {
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.houses-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: var(--spacing-md);
	}

	.house-card {
		background: white;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
		cursor: pointer;
		border: none;
		text-align: left;
		width: 100%;
	}

	.house-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-md);
	}

	.house-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
		background: var(--color-surface);
	}

	.house-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.house-image.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-icon {
		font-size: 3rem;
		opacity: 0.3;
	}

	.house-info {
		padding: var(--spacing-md);
	}

	.house-info h3 {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.location {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
	}

	.house-details {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.detail {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-sm);
	}

	.detail-label {
		color: var(--color-text-secondary);
	}

	.detail-value {
		color: var(--color-text-primary);
		font-weight: 500;
	}

	@media (max-width: 768px) {
		.houses-page {
			padding: var(--spacing-md);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.houses-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
