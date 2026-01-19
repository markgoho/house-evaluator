<script lang="ts">
	import { criteriaStore } from '$lib/stores/criteria-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import {
		createCriterion,
		updateCriterion,
		deleteCriterion
	} from '$lib/services/criterion-service';
	import type { CriterionInput } from '$lib/types';

	let showAddForm = $state(false);
	let editingId = $state<string | null>(null);

	let formName = $state('');
	let formDescription = $state('');
	let formWeight = $state(5);

	let submitting = $state(false);
	let error = $state<string | null>(null);

	function startAdding() {
		showAddForm = true;
		editingId = null;
		formName = '';
		formDescription = '';
		formWeight = 5;
	}

	function startEditing(criterionId: string) {
		const criterion = $criteriaStore.criteria.find((c) => c.id === criterionId);
		if (!criterion) return;

		editingId = criterionId;
		showAddForm = true;
		formName = criterion.name;
		formDescription = criterion.description ?? '';
		formWeight = criterion.weight;
	}

	function cancelForm() {
		showAddForm = false;
		editingId = null;
		formName = '';
		formDescription = '';
		formWeight = 5;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!$userProfileStore.profile?.familyId) {
			error = 'No family ID found';
			return;
		}

		submitting = true;
		error = null;

		try {
			if (editingId) {
				await updateCriterion($userProfileStore.profile.familyId, editingId, {
					name: formName,
					description: formDescription || null,
					weight: formWeight
				});
			} else {
				const newOrder = $criteriaStore.criteria.length;
				const criterionData: CriterionInput = {
					familyId: $userProfileStore.profile.familyId,
					name: formName,
					description: formDescription || null,
					weight: formWeight,
					order: newOrder
				};
				await createCriterion($userProfileStore.profile.familyId, criterionData);
			}

			cancelForm();
		} catch (err) {
			console.error('Error saving criterion:', err);
			error = err instanceof Error ? err.message : 'Failed to save criterion';
		} finally {
			submitting = false;
		}
	}

	async function handleDelete(criterionId: string) {
		if (!confirm('Are you sure you want to delete this criterion?')) return;

		if (!$userProfileStore.profile?.familyId) return;

		try {
			await deleteCriterion($userProfileStore.profile.familyId, criterionId);
		} catch (err) {
			console.error('Error deleting criterion:', err);
			alert('Failed to delete criterion');
		}
	}
</script>

<div class="criteria-page">
	<div class="container">
		<header class="page-header">
			<div class="header-content">
				<h1>Rating Criteria</h1>
				<p class="header-subtitle">Customize the criteria used to evaluate houses</p>
			</div>
			{#if !showAddForm}
				<button onclick={startAdding} class="btn-primary">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 5V19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Add Criterion</span>
				</button>
			{/if}
		</header>

		{#if error}
			<div class="error-banner">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="16" r="1" fill="currentColor"/>
				</svg>
				<span>{error}</span>
			</div>
		{/if}

		{#if showAddForm}
			<div class="form-card">
				<h2>{editingId ? 'Edit Criterion' : 'Add New Criterion'}</h2>
				<form onsubmit={handleSubmit}>
					<div class="form-field">
						<label for="name">Criterion Name</label>
						<input
							type="text"
							id="name"
							bind:value={formName}
							required
							placeholder="e.g. Kitchen Quality"
							class="input"
						/>
					</div>

					<div class="form-field">
						<label for="description">Description (optional)</label>
						<textarea
							id="description"
							bind:value={formDescription}
							rows="3"
							placeholder="Brief description of what to look for..."
							class="textarea"
						></textarea>
					</div>

					<div class="form-field">
						<label for="weight">
							Importance Weight
							<span class="weight-display">{formWeight} / 10</span>
						</label>
						<div class="range-wrapper">
							<input type="range" id="weight" bind:value={formWeight} min="1" max="10" step="1" />
							<div class="range-labels">
								<span>Low</span>
								<span>High</span>
							</div>
						</div>
						<p class="field-hint">Higher weight means more impact on the overall score</p>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn-primary" disabled={submitting}>
							{submitting ? 'Saving...' : editingId ? 'Update Criterion' : 'Add Criterion'}
						</button>
						<button type="button" onclick={cancelForm} class="btn-secondary">Cancel</button>
					</div>
				</form>
			</div>
		{/if}

		<div class="criteria-list">
			{#if $criteriaStore.loading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p>Loading criteria...</p>
				</div>
			{:else if $criteriaStore.criteria.length === 0}
				<div class="empty-state">
					<div class="empty-illustration">
						<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 20V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M18 20V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M6 20V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<h2>No criteria yet</h2>
					<p>Add your first criterion to start rating houses</p>
				</div>
			{:else}
				{#each $criteriaStore.criteria as criterion (criterion.id)}
					<div class="criterion-card">
						<div class="criterion-main">
							<div class="criterion-info">
								<h3>{criterion.name}</h3>
								{#if criterion.description}
									<p class="criterion-description">{criterion.description}</p>
								{/if}
							</div>
							<div class="criterion-weight">
								<span class="weight-value">{criterion.weight}</span>
								<span class="weight-label">/ 10</span>
							</div>
						</div>
						<div class="criterion-actions">
							<button
								onclick={() => startEditing(criterion.id)}
								class="action-btn"
								title="Edit"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
							<button
								onclick={() => handleDelete(criterion.id)}
								class="action-btn danger"
								title="Delete"
							>
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
									<path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
							</button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	.criteria-page {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
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

	/* Buttons */
	.btn-primary,
	.btn-secondary {
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

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-primary);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

	/* Error Banner */
	.error-banner {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		background: var(--color-error-light);
		color: var(--color-error);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-sm);
	}

	/* Form Card */
	.form-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.form-card h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-lg);
	}

	.form-field {
		margin-bottom: var(--spacing-lg);
	}

	.form-field label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.weight-display {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-primary);
	}

	.input,
	.textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		background: var(--color-surface);
	}

	.input:focus,
	.textarea:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-primary-subtle);
	}

	.range-wrapper {
		padding: var(--spacing-sm) 0;
	}

	input[type='range'] {
		width: 100%;
		height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-border-light);
		outline: none;
		-webkit-appearance: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
		box-shadow: var(--shadow-sm);
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		margin-top: var(--spacing-xs);
	}

	.field-hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}

	/* Loading State */
	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		color: var(--color-text-secondary);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Empty State */
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
		width: 100px;
		height: 100px;
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
	}

	/* Criteria List */
	.criteria-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.criterion-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
	}

	.criterion-card:hover {
		border-color: var(--color-border);
	}

	.criterion-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 1;
		gap: var(--spacing-lg);
	}

	.criterion-info {
		flex: 1;
	}

	.criterion-info h3 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.criterion-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.criterion-weight {
		display: flex;
		align-items: baseline;
		gap: 2px;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-primary-subtle);
		border-radius: var(--radius-md);
	}

	.weight-value {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-primary);
	}

	.weight-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.criterion-actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.action-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.action-btn:hover {
		background: var(--color-background);
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.action-btn.danger:hover {
		background: var(--color-error-light);
		color: var(--color-error);
		border-color: var(--color-error);
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.criteria-page {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}

		.page-header {
			flex-direction: column;
			align-items: stretch;
		}

		.btn-primary {
			width: 100%;
			justify-content: center;
		}

		.criterion-card {
			flex-direction: column;
			align-items: stretch;
		}

		.criterion-main {
			flex-direction: column;
			align-items: flex-start;
		}

		.criterion-weight {
			align-self: flex-start;
		}

		.criterion-actions {
			justify-content: flex-end;
			padding-top: var(--spacing-md);
			border-top: 1px solid var(--color-border-light);
		}
	}
</style>
