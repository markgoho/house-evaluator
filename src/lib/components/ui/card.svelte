<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		hover = false,
		onclick
	}: {
		children: Snippet;
		hover?: boolean;
		onclick?: () => void;
	} = $props();
</script>

{#if onclick}
	<button class="card" class:hover onclick={onclick}>
		{@render children()}
	</button>
{:else}
	<div class="card" class:hover>
		{@render children()}
	</div>
{/if}

<style>
	.card {
		display: flex;
		flex-direction: column;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		text-align: left;
		width: 100%;
	}

	button.card {
		cursor: pointer;
		border: 1px solid var(--color-border-light);
	}

	.card.hover:hover {
		border-color: var(--color-border);
		box-shadow: var(--shadow-md);
	}

	button.card.hover:hover {
		border-color: var(--color-primary);
	}
</style>
