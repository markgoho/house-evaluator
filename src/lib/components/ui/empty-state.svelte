<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		icon,
		action
	}: {
		title: string;
		description: string;
		icon: Snippet;
		action?: Snippet;
	} = $props();
</script>

<div class="empty-state">
	<div class="empty-illustration">
		{@render icon()}
	</div>
	<h2>{title}</h2>
	<p>{description}</p>
	{#if action}
		<div class="empty-action">
			{@render action()}
		</div>
	{/if}
</div>

<style>
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

	.empty-action {
		margin-top: var(--spacing-md);
	}
</style>
