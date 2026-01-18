<script lang="ts">
	import { goto } from '$app/navigation';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { authStore } from '$lib/stores/auth-store';
	import { createHouse } from '$lib/services/house-service';
	import type { HouseInput } from '$lib/types';

	let loading = $state(false);
	let error = $state<string | null>(null);

	// Form fields
	let address = $state('');
	let city = $state('');
	let stateField = $state('');
	let zipCode = $state('');
	let squareFeet = $state<number | null>(null);
	let lotSize = $state<number | null>(null);
	let bedrooms = $state<number | null>(null);
	let bathrooms = $state<number | null>(null);
	let yearBuilt = $state<number | null>(null);
	let price = $state<number | null>(null);
	let listingUrl = $state('');
	let notes = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!$userProfileStore.profile?.familyId) {
			error = 'No family ID found';
			return;
		}

		if (!$authStore.user) {
			error = 'Not authenticated';
			return;
		}

		loading = true;
		error = null;

		try {
			const houseData: HouseInput = {
				familyId: $userProfileStore.profile.familyId,
				address,
				city,
				state: stateField,
				zipCode,
				squareFeet,
				lotSize,
				bedrooms,
				bathrooms,
				yearBuilt,
				price,
				listingUrl: listingUrl || null,
				photoUrls: [],
				notes: notes || null,
				createdBy: $authStore.user.uid
			};

			const houseId = await createHouse(houseData);
			goto(`/houses/${houseId}`);
		} catch (err) {
			console.error('Error creating house:', err);
			error = err instanceof Error ? err.message : 'Failed to create house';
		} finally {
			loading = false;
		}
	}
</script>

<div class="new-house-page">
	<div class="container">
		<div class="page-header">
			<h1>Add New House</h1>
			<a href="/houses" class="btn-secondary">Cancel</a>
		</div>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form onsubmit={handleSubmit} class="house-form">
			<div class="form-section">
				<h2>Address</h2>
				<div class="form-row">
					<div class="form-field full-width">
						<label for="address">Street Address *</label>
						<input
							type="text"
							id="address"
							bind:value={address}
							required
							placeholder="123 Main St"
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-field">
						<label for="city">City *</label>
						<input type="text" id="city" bind:value={city} required placeholder="San Francisco" />
					</div>
					<div class="form-field">
						<label for="state">State *</label>
						<input type="text" id="state" bind:value={stateField} required placeholder="CA" />
					</div>
					<div class="form-field">
						<label for="zipCode">ZIP Code *</label>
						<input type="text" id="zipCode" bind:value={zipCode} required placeholder="94102" />
					</div>
				</div>
			</div>

			<div class="form-section">
				<h2>Property Details</h2>
				<div class="form-row">
					<div class="form-field">
						<label for="price">Price</label>
						<input type="number" id="price" bind:value={price} placeholder="500000" step="1000" />
					</div>
					<div class="form-field">
						<label for="squareFeet">Square Feet</label>
						<input type="number" id="squareFeet" bind:value={squareFeet} placeholder="2000" />
					</div>
				</div>

				<div class="form-row">
					<div class="form-field">
						<label for="bedrooms">Bedrooms</label>
						<input type="number" id="bedrooms" bind:value={bedrooms} placeholder="3" min="0" />
					</div>
					<div class="form-field">
						<label for="bathrooms">Bathrooms</label>
						<input
							type="number"
							id="bathrooms"
							bind:value={bathrooms}
							placeholder="2"
							min="0"
							step="0.5"
						/>
					</div>
					<div class="form-field">
						<label for="yearBuilt">Year Built</label>
						<input
							type="number"
							id="yearBuilt"
							bind:value={yearBuilt}
							placeholder="1990"
							min="1800"
							max={new Date().getFullYear()}
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-field full-width">
						<label for="lotSize">Lot Size (sq ft)</label>
						<input type="number" id="lotSize" bind:value={lotSize} placeholder="5000" />
					</div>
				</div>
			</div>

			<div class="form-section">
				<h2>Additional Information</h2>
				<div class="form-row">
					<div class="form-field full-width">
						<label for="listingUrl">Listing URL</label>
						<input
							type="url"
							id="listingUrl"
							bind:value={listingUrl}
							placeholder="https://zillow.com/..."
						/>
					</div>
				</div>

				<div class="form-row">
					<div class="form-field full-width">
						<label for="notes">Notes</label>
						<textarea
							id="notes"
							bind:value={notes}
							rows="4"
							placeholder="Add any notes about this property..."
						></textarea>
					</div>
				</div>
			</div>

			<div class="form-actions">
				<button type="submit" class="btn-primary" disabled={loading}>
					{loading ? 'Creating...' : 'Add House'}
				</button>
				<a href="/houses" class="btn-secondary">Cancel</a>
			</div>
		</form>
	</div>
</div>

<style>
	.new-house-page {
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

	.error-message {
		background: #ffebee;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-md);
	}

	.house-form {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
	}

	.form-section {
		margin-bottom: var(--spacing-xl);
	}

	.form-section h2 {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
		padding-bottom: var(--spacing-sm);
		border-bottom: 1px solid var(--color-border);
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.form-field.full-width {
		grid-column: 1 / -1;
	}

	label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	input,
	textarea {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
		transition: border-color 0.2s;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	textarea {
		resize: vertical;
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		margin-top: var(--spacing-xl);
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--color-border);
	}

	.btn-primary,
	.btn-secondary {
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-base);
	}

	.btn-primary {
		background: var(--color-primary);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-secondary {
		background: white;
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-surface);
	}

	@media (max-width: 768px) {
		.new-house-page {
			padding: var(--spacing-md);
		}

		.house-form {
			padding: var(--spacing-md);
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
		}
	}
</style>
