<script lang="ts">
	import type { House, MortgageSettings } from '$lib/types';
	import { calculateMonthlyCost, type MonthlyCostBreakdown } from '$lib/services/calculate-monthly-cost';
	import { findTaxRates } from '$lib/services/find-tax-rates';
	import type { TaxRateEntry } from '$lib/config/tax-rates';
	import MortgageSettingsModal from './mortgage-settings-modal.svelte';

	let {
		house,
		mortgageSettings,
		onupdatesettings
	}: {
		house: House;
		mortgageSettings: MortgageSettings;
		onupdatesettings: (settings: MortgageSettings) => void;
	} = $props();

	let showSettingsModal = $state(false);

	const taxRates: TaxRateEntry | undefined = $derived(
		findTaxRates({ city: house.city, state: house.state })
	);

	const breakdown: MonthlyCostBreakdown | undefined = $derived.by(() => {
		if (house.price === null) return undefined;

		return calculateMonthlyCost({
			price: house.price,
			taxAssessedValue: house.taxAssessedValue ?? undefined,
			mortgageSettings,
			taxRates
		});
	});

	function formatCurrency(value: number): string {
		return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
	}

	function handleSettingsUpdate(settings: MortgageSettings): void {
		onupdatesettings(settings);
		showSettingsModal = false;
	}
</script>

<section class="card monthly-cost-card">
	<h2 class="card-title">Monthly Cost Estimate</h2>

	{#if house.price === null}
		<p class="no-data-message">No listing price available to calculate monthly costs.</p>
	{:else if breakdown !== undefined}
		<div class="total-cost">
			<span class="total-label">Total Monthly Payment</span>
			<span class="total-value">{formatCurrency(breakdown.totalMonthlyPayment)}</span>
		</div>

		<div class="cost-breakdown">
			<div class="cost-line">
				<span class="cost-label">Principal & Interest</span>
				<span class="cost-amount">{formatCurrency(breakdown.monthlyPrincipalAndInterest)}</span>
			</div>
			{#if taxRates !== undefined && house.taxAssessedValue !== null && house.taxAssessedValue !== undefined}
				<div class="cost-line">
					<span class="cost-label">
						Property Tax
						<span class="rate-detail">County {taxRates.countyTaxRate} + Town {taxRates.townTaxRate} per $1k</span>
					</span>
					<span class="cost-amount">{formatCurrency(breakdown.monthlyPropertyTax)}</span>
				</div>
				<div class="cost-line">
					<span class="cost-label">
						School Tax
						<span class="rate-detail">{taxRates.schoolDistrict} — {taxRates.schoolTaxRate} per $1k</span>
					</span>
					<span class="cost-amount">{formatCurrency(breakdown.monthlySchoolTax)}</span>
				</div>
			{:else if house.taxAssessedValue === null || house.taxAssessedValue === undefined}
				<p class="tax-note">Tax assessed value not available — tax estimates excluded.</p>
			{:else}
				<p class="tax-note">Tax rates not available for {house.city}, {house.state}.</p>
			{/if}
		</div>

		<div class="assumptions">
			<h3 class="assumptions-title">Assumptions</h3>
			<div class="assumption-list">
				<div class="assumption-item">
					<span class="assumption-label">Down payment</span>
					<span class="assumption-value">{mortgageSettings.downPaymentPercent}% ({formatCurrency(breakdown.downPayment)})</span>
				</div>
				<div class="assumption-item">
					<span class="assumption-label">Mortgage rate</span>
					<span class="assumption-value">{mortgageSettings.mortgageRatePercent}% ({mortgageSettings.loanTermYears}-year fixed)</span>
				</div>
				<div class="assumption-item">
					<span class="assumption-label">Loan amount</span>
					<span class="assumption-value">{formatCurrency(breakdown.loanAmount)}</span>
				</div>
				{#if house.taxAssessedValue !== null && house.taxAssessedValue !== undefined}
					<div class="assumption-item">
						<span class="assumption-label">Tax assessed value</span>
						<span class="assumption-value">{formatCurrency(house.taxAssessedValue)}</span>
					</div>
				{/if}
			</div>
		</div>

		<button class="edit-settings-button" onclick={() => (showSettingsModal = true)}>
			Edit Settings
		</button>
	{/if}
</section>

{#if showSettingsModal}
	<MortgageSettingsModal
		settings={mortgageSettings}
		onsave={handleSettingsUpdate}
		onclose={() => (showSettingsModal = false)}
	/>
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

	.no-data-message {
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
	}

	.total-cost {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-lg);
	}

	.total-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.total-value {
		font-family: var(--font-display);
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-primary);
	}

	.cost-breakdown {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
		padding-bottom: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border-light);
	}

	.cost-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.cost-label {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.rate-detail {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.cost-amount {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.tax-note {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: var(--spacing-xs);
	}

	.assumptions {
		margin-bottom: var(--spacing-lg);
	}

	.assumptions-title {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: var(--spacing-sm);
	}

	.assumption-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.assumption-item {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-sm);
	}

	.assumption-label {
		color: var(--color-text-muted);
	}

	.assumption-value {
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.edit-settings-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-primary);
		background: transparent;
		border: 1px solid var(--color-primary);
		cursor: pointer;
		transition: all 0.2s;
	}

	.edit-settings-button:hover {
		background: var(--color-primary);
		color: white;
	}
</style>
