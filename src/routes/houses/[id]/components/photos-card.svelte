<script lang="ts">
	let {
		photoUrls,
		address
	}: {
		photoUrls: string[];
		address: string;
	} = $props();
</script>

{#if photoUrls.length > 0}
	<section class="card photos-card">
		<h2 class="card-title">Photos</h2>
		<div class="photos-grid">
			{#each photoUrls as photoUrl}
				<img src={photoUrl} alt={address} class="photo" />
			{/each}
		</div>
	</section>
{/if}

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
</style>
