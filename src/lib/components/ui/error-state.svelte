<script lang="ts">
	let { message }: { message: string } = $props();
</script>

<div class="error-state">
	<svg
		width="48"
		height="48"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
		<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		<circle cx="12" cy="16" r="1" fill="currentColor" />
	</svg>
	<p>{message}</p>
</div>

<style>
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

	.error-state p {
		font-size: var(--font-size-base);
	}
</style>
