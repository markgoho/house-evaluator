<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		id,
		hint,
		error,
		required = false,
		children
	}: {
		label: string;
		id: string;
		hint?: string;
		error?: string;
		required?: boolean;
		children: Snippet;
	} = $props();
</script>

<div class="form-field">
	<label for={id}>
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
	{@render children()}
	{#if hint && !error}
		<p class="field-hint">{hint}</p>
	{/if}
	{#if error}
		<p class="field-error">{error}</p>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: var(--spacing-lg);
	}

	.form-field label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.required {
		color: var(--color-error);
	}

	.field-hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.field-error {
		font-size: var(--font-size-sm);
		color: var(--color-error);
		margin-top: var(--spacing-xs);
	}
</style>
