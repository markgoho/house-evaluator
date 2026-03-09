<script lang="ts">
	import type { MortgageSettings } from '$lib/types';

	let {
		settings,
		onsave,
		onclose
	}: {
		settings: MortgageSettings;
		onsave: (settings: MortgageSettings) => void;
		onclose: () => void;
	} = $props();

	let downPaymentPercent = $state(settings.downPaymentPercent);
	let mortgageRatePercent = $state(settings.mortgageRatePercent);
	let loanTermYears = $state(settings.loanTermYears);

	function handleSubmit(event: Event): void {
		event.preventDefault();
		onsave({
			downPaymentPercent,
			mortgageRatePercent,
			loanTermYears
		});
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="modal-backdrop" onclick={handleBackdropClick}>
	<div class="modal" role="dialog" aria-label="Mortgage Settings">
		<div class="modal-header">
			<h2>Mortgage Settings</h2>
			<button class="close-button" onclick={onclose} aria-label="Close">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</button>
		</div>

		<form onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="down-payment">Down Payment (%)</label>
				<input
					id="down-payment"
					type="number"
					min="0"
					max="100"
					step="0.5"
					bind:value={downPaymentPercent}
				/>
			</div>

			<div class="form-group">
				<label for="mortgage-rate">Mortgage Rate (%)</label>
				<input
					id="mortgage-rate"
					type="number"
					min="0"
					max="20"
					step="0.125"
					bind:value={mortgageRatePercent}
				/>
			</div>

			<div class="form-group">
				<label for="loan-term">Loan Term</label>
				<div class="term-toggle">
					<button
						type="button"
						class="term-option"
						class:active={loanTermYears === 15}
						onclick={() => (loanTermYears = 15)}
					>
						15 years
					</button>
					<button
						type="button"
						class="term-option"
						class:active={loanTermYears === 30}
						onclick={() => (loanTermYears = 30)}
					>
						30 years
					</button>
				</div>
			</div>

			<div class="modal-actions">
				<button type="button" class="btn-secondary" onclick={onclose}>Cancel</button>
				<button type="submit" class="btn-primary">Save Settings</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: var(--color-surface);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		width: 90%;
		max-width: 400px;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-xl);
	}

	.modal-header h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.close-button {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-text-muted);
		padding: var(--spacing-xs);
		border-radius: var(--radius-sm);
	}

	.close-button:hover {
		color: var(--color-text-primary);
		background: var(--color-background);
	}

	.form-group {
		margin-bottom: var(--spacing-lg);
	}

	.form-group label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.form-group input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		background: var(--color-background);
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.term-toggle {
		display: flex;
		gap: var(--spacing-sm);
	}

	.term-option {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-background);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.term-option:hover {
		border-color: var(--color-primary);
	}

	.term-option.active {
		background: var(--color-primary);
		color: white;
		border-color: var(--color-primary);
	}

	.modal-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
		margin-top: var(--spacing-xl);
	}

	.btn-secondary {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: var(--font-size-sm);
		border: 1px solid var(--color-border);
		background: white;
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.btn-secondary:hover {
		background: var(--color-background);
	}

	.btn-primary {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		font-weight: 500;
		font-size: var(--font-size-sm);
		border: none;
		background: var(--color-primary);
		color: white;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}
</style>
