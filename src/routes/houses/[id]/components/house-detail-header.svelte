<script lang="ts">
	import type { House } from '$lib/types';

	let {
		house,
		houseId,
		ondelete
	}: {
		house: House;
		houseId: string;
		ondelete: () => void;
	} = $props();
</script>

<header class="page-header">
	<div class="header-content">
		<a href="/houses" class="back-link">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M19 12H5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<path
					d="M12 19L5 12L12 5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Back to Houses</span>
		</a>
		<h1>{house.address}</h1>
		<p class="location">{house.city}, {house.state} {house.zipCode}</p>
	</div>
	<div class="header-actions">
		<a href={`/houses/${houseId}/rate`} class="btn-primary">
			<svg
				width="18"
				height="18"
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<polygon
					points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Rate House</span>
		</a>
		<a href={`/houses/${houseId}/edit`} class="btn-secondary">Edit</a>
		<button onclick={ondelete} class="btn-danger">Delete</button>
	</div>
</header>

<style>
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

	@media (max-width: 767px) {
		.header-actions {
			flex-direction: column;
		}

		.btn-primary,
		.btn-secondary,
		.btn-danger {
			width: 100%;
			justify-content: center;
		}
	}
</style>
