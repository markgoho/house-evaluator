<script lang="ts">
	import type { HouseFormData } from '$lib/types';
	import { houseFormSchema } from '$lib/schemas';
	import { ZodError } from 'zod';
	import { PROPERTY } from '$lib/constants';

	interface Props {
		initialData?: Partial<HouseFormData>;
		submitButtonText: string;
		submitButtonLoadingText: string;
		cancelUrl: string;
		isSubmitting: boolean;
		errorMessage: string | null;
		sourceImageUrl?: string;
		onsubmit: (data: HouseFormData) => void;
	}

	let {
		initialData = {},
		submitButtonText,
		submitButtonLoadingText,
		cancelUrl,
		isSubmitting,
		errorMessage,
		sourceImageUrl,
		onsubmit
	}: Props = $props();

	// Form fields - will be synced with initialData via $effect
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

	// Validation errors state
	let validationErrors = $state<Record<string, string>>({});

	// Sync form fields with initialData prop changes
	$effect(() => {
		address = initialData.address ?? '';
		city = initialData.city ?? '';
		stateField = initialData.state ?? '';
		zipCode = initialData.zipCode ?? '';
		squareFeet = initialData.squareFeet ?? null;
		lotSize = initialData.lotSize ?? null;
		bedrooms = initialData.bedrooms ?? null;
		bathrooms = initialData.bathrooms ?? null;
		yearBuilt = initialData.yearBuilt ?? null;
		price = initialData.price ?? null;
		listingUrl = initialData.listingUrl ?? '';
		notes = initialData.notes ?? '';
	});

	function handleSubmit(e: Event) {
		e.preventDefault();

		// Clear previous errors
		validationErrors = {};

		const formData: HouseFormData = {
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
			notes: notes || null
		};

		// Validate with Zod
		try {
			houseFormSchema.parse(formData);
			onsubmit(formData);
		} catch (error) {
			if (error instanceof ZodError) {
				// Convert Zod errors to field-level error messages
				const errors: Record<string, string> = {};
				for (const issue of error.issues) {
					const field = issue.path[0];
					if (field !== undefined) {
						errors[String(field)] = issue.message;
					}
				}
				validationErrors = errors;
			} else {
				throw error;
			}
		}
	}
</script>

{#if errorMessage}
	<div class="error-message">{errorMessage}</div>
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
					class:error={validationErrors['address']}
				/>
				{#if validationErrors['address']}
					<span class="field-error">{validationErrors['address']}</span>
				{/if}
			</div>
		</div>

		<div class="form-row">
			<div class="form-field">
				<label for="city">City *</label>
				<input
					type="text"
					id="city"
					bind:value={city}
					required
					placeholder="San Francisco"
					class:error={validationErrors['city']}
				/>
				{#if validationErrors['city']}
					<span class="field-error">{validationErrors['city']}</span>
				{/if}
			</div>
			<div class="form-field">
				<label for="state">State *</label>
				<input
					type="text"
					id="state"
					bind:value={stateField}
					required
					placeholder="CA"
					class:error={validationErrors['state']}
				/>
				{#if validationErrors['state']}
					<span class="field-error">{validationErrors['state']}</span>
				{/if}
			</div>
			<div class="form-field">
				<label for="zipCode">ZIP Code *</label>
				<input
					type="text"
					id="zipCode"
					bind:value={zipCode}
					required
					placeholder="94102"
					class:error={validationErrors['zipCode']}
				/>
				{#if validationErrors['zipCode']}
					<span class="field-error">{validationErrors['zipCode']}</span>
				{/if}
			</div>
		</div>
	</div>

	<div class="form-section">
		<h2>Property Details</h2>
		<div class="form-row">
			<div class="form-field">
				<label for="price">Price</label>
				<input
					type="number"
					id="price"
					bind:value={price}
					placeholder="500000"
					step="1"
					class:error={validationErrors['price']}
				/>
				{#if validationErrors['price']}
					<span class="field-error">{validationErrors['price']}</span>
				{/if}
			</div>
			<div class="form-field">
				<label for="squareFeet">Square Feet</label>
				<input
					type="number"
					id="squareFeet"
					bind:value={squareFeet}
					placeholder="2000"
					class:error={validationErrors['squareFeet']}
				/>
				{#if validationErrors['squareFeet']}
					<span class="field-error">{validationErrors['squareFeet']}</span>
				{/if}
			</div>
		</div>

		<div class="form-row">
			<div class="form-field">
				<label for="bedrooms">Bedrooms</label>
				<input
					type="number"
					id="bedrooms"
					bind:value={bedrooms}
					placeholder="3"
					min={PROPERTY.MIN_BEDROOMS}
					class:error={validationErrors['bedrooms']}
				/>
				{#if validationErrors['bedrooms']}
					<span class="field-error">{validationErrors['bedrooms']}</span>
				{/if}
			</div>
			<div class="form-field">
				<label for="bathrooms">Bathrooms</label>
				<input
					type="number"
					id="bathrooms"
					bind:value={bathrooms}
					placeholder="2"
					min={PROPERTY.MIN_BATHROOMS}
					step="0.5"
					class:error={validationErrors['bathrooms']}
				/>
				{#if validationErrors['bathrooms']}
					<span class="field-error">{validationErrors['bathrooms']}</span>
				{/if}
			</div>
			<div class="form-field">
				<label for="yearBuilt">Year Built</label>
				<input
					type="number"
					id="yearBuilt"
					bind:value={yearBuilt}
					placeholder="1990"
					min={PROPERTY.MIN_YEAR_BUILT}
					max={PROPERTY.MAX_YEAR_BUILT}
					class:error={validationErrors['yearBuilt']}
				/>
				{#if validationErrors['yearBuilt']}
					<span class="field-error">{validationErrors['yearBuilt']}</span>
				{/if}
			</div>
		</div>

		<div class="form-row">
			<div class="form-field full-width">
				<label for="lotSize">Lot Size (sq ft)</label>
				<input
					type="number"
					id="lotSize"
					bind:value={lotSize}
					placeholder="5000"
					class:error={validationErrors['lotSize']}
				/>
				{#if validationErrors['lotSize']}
					<span class="field-error">{validationErrors['lotSize']}</span>
				{/if}
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
					class:error={validationErrors['listingUrl']}
				/>
				{#if validationErrors['listingUrl']}
					<span class="field-error">{validationErrors['listingUrl']}</span>
				{/if}
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
					class:error={validationErrors['notes']}
				></textarea>
				{#if validationErrors['notes']}
					<span class="field-error">{validationErrors['notes']}</span>
				{/if}
			</div>
		</div>
	</div>

	{#if sourceImageUrl}
		<div class="form-section">
			<h2>Property Photo</h2>
			<div class="image-preview">
				<img src={sourceImageUrl} alt="Property preview" />
				<p class="image-note">This image will be uploaded when you create the house</p>
			</div>
		</div>
	{/if}

	<div class="form-actions">
		<button type="submit" class="btn-primary" disabled={isSubmitting}>
			{isSubmitting ? submitButtonLoadingText : submitButtonText}
		</button>
		<a href={cancelUrl} class="btn-secondary">Cancel</a>
	</div>
</form>

<style>
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

	input.error,
	textarea.error {
		border-color: var(--color-error);
		background-color: rgba(196, 92, 92, 0.05);
	}

	input.error:focus,
	textarea.error:focus {
		border-color: var(--color-error);
		box-shadow: 0 0 0 3px rgba(196, 92, 92, 0.1);
	}

	.field-error {
		display: block;
		color: var(--color-error);
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-xs);
		font-weight: 500;
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

	.image-preview {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		align-items: center;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 400px;
		width: auto;
		height: auto;
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		object-fit: contain;
	}

	.image-note {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-style: italic;
		text-align: center;
	}

	@media (max-width: 768px) {
		.house-form {
			padding: var(--spacing-md);
		}

		.form-row {
			grid-template-columns: 1fr;
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
