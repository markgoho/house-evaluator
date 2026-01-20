<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		subtitle,
		action
	}: {
		title: string;
		subtitle?: string;
		action?: Snippet;
	} = $props();
</script>

<header class="page-header">
	<div class="header-content">
		<h1>{title}</h1>
		{#if subtitle}
			<p class="header-subtitle">{subtitle}</p>
		{/if}
	</div>
	{#if action}
		{@render action()}
	{/if}
</header>

<style>
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

	@media (max-width: 767px) {
		.page-header {
			flex-direction: column;
			align-items: stretch;
		}
	}
</style>
