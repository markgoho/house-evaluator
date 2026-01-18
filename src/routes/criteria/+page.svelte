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

	// Form fields
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
				// Update existing criterion
				await updateCriterion($userProfileStore.profile.familyId, editingId, {
					name: formName,
					description: formDescription || null,
					weight: formWeight
				});
			} else {
				// Create new criterion
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
		<div class="page-header">
			<div>
				<h1>Rating Criteria</h1>
				<p class="page-description">Customize the criteria used to evaluate houses</p>
			</div>
			{#if !showAddForm}
				<button onclick={startAdding} class="btn-primary">Add Criterion</button>
			{/if}
		</div>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		{#if showAddForm}
			<div class="criterion-form card">
				<h2>{editingId ? 'Edit Criterion' : 'Add New Criterion'}</h2>
				<form onsubmit={handleSubmit}>
					<div class="form-field">
						<label for="name">Criterion Name *</label>
						<input
							type="text"
							id="name"
							bind:value={formName}
							required
							placeholder="e.g. Kitchen Quality"
						/>
					</div>

					<div class="form-field">
						<label for="description">Description</label>
						<textarea
							id="description"
							bind:value={formDescription}
							rows="3"
							placeholder="Brief description of what to look for..."
						></textarea>
					</div>

					<div class="form-field">
						<label for="weight">
							Importance Weight: {formWeight}/10
						</label>
						<input type="range" id="weight" bind:value={formWeight} min="1" max="10" step="1" />
						<p class="field-hint">Higher weight means this criterion has more impact on the overall score</p>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn-primary" disabled={submitting}>
							{submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
						</button>
						<button type="button" onclick={cancelForm} class="btn-secondary">Cancel</button>
					</div>
				</form>
			</div>
		{/if}

		<div class="criteria-list">
			{#if $criteriaStore.loading}
				<div class="loading">Loading criteria...</div>
			{:else if $criteriaStore.criteria.length === 0}
				<div class="empty-state card">
					<div class="empty-icon">⚙️</div>
					<h2>No criteria yet</h2>
					<p>Add your first criterion to start rating houses</p>
				</div>
			{:else}
				{#each $criteriaStore.criteria as criterion (criterion.id)}
					<div class="criterion-card card">
						<div class="criterion-content">
							<div class="criterion-info">
								<h3>{criterion.name}</h3>
								{#if criterion.description}
									<p class="description">{criterion.description}</p>
								{/if}
							</div>
							<div class="criterion-weight">
								<span class="weight-label">Weight:</span>
								<span class="weight-value">{criterion.weight}/10</span>
							</div>
						</div>
						<div class="criterion-actions">
							<button
								onclick={() => startEditing(criterion.id)}
								class="btn-icon"
								title="Edit"
							>
								✏️
							</button>
							<button
								onclick={() => handleDelete(criterion.id)}
								class="btn-icon danger"
								title="Delete"
							>
								🗑️
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
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-xl);
	}

	h1 {
		font-size: var(--font-size-2xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.page-description {
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
	}

	.error-message {
		background: #ffebee;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-md);
	}

	.card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}

	.criterion-form {
		margin-bottom: var(--spacing-xl);
	}

	.criterion-form h2 {
		font-size: var(--font-size-xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
	}

	.form-field {
		margin-bottom: var(--spacing-md);
	}

	label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--font-size-base);
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	input[type='range'] {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: var(--color-surface);
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
	}

	input[type='range']::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
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

	.loading {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-xl) * 2;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-md);
	}

	.empty-state h2 {
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
	}

	.criteria-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.criterion-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.criterion-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex: 1;
		gap: var(--spacing-md);
	}

	.criterion-info {
		flex: 1;
	}

	.criterion-info h3 {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.description {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.criterion-weight {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.weight-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.weight-value {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-primary);
	}

	.criterion-actions {
		display: flex;
		gap: var(--spacing-sm);
		margin-left: var(--spacing-md);
	}

	.btn-icon {
		width: 36px;
		height: 36px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 1.2rem;
	}

	.btn-icon:hover {
		background: var(--color-surface);
		transform: translateY(-1px);
	}

	.btn-icon.danger:hover {
		background: var(--color-error);
		border-color: var(--color-error);
		color: white;
	}

	@media (max-width: 768px) {
		.criteria-page {
			padding: var(--spacing-md);
		}

		.page-header {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.btn-primary {
			width: 100%;
		}

		.criterion-card {
			flex-direction: column;
			align-items: stretch;
		}

		.criterion-content {
			flex-direction: column;
			align-items: stretch;
			margin-bottom: var(--spacing-md);
		}

		.criterion-weight {
			flex-direction: row;
			justify-content: space-between;
		}

		.criterion-actions {
			justify-content: flex-end;
			margin-left: 0;
		}
	}
</style>
