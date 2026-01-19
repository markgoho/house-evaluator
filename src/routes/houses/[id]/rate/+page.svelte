<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { authStore } from '$lib/stores/auth-store';
	import { criteriaStore } from '$lib/stores/criteria-store';
	import { getHouse } from '$lib/services/house-service';
	import { createOrUpdateRating, getRatingByUserAndHouse } from '$lib/services/rating-service';
	import type { House, RatingInput } from '$lib/types';

	let house = $state<House | null>(null);
	let loading = $state(true);
	let submitting = $state(false);
	let error = $state<string | null>(null);

	// Form state
	let criteriaScores = $state<Record<string, number>>({});
	let comments = $state('');

	const houseId = $derived($page.params.id);

	onMount(async () => {
		await loadHouse();
		await loadExistingRating();
	});

	async function loadHouse() {
		if (!$userProfileStore.profile?.familyId || !houseId) {
			error = 'No family ID or house ID found';
			loading = false;
			return;
		}

		try {
			house = await getHouse($userProfileStore.profile.familyId, houseId);
			loading = false;
		} catch (err) {
			console.error('Error loading house:', err);
			error = err instanceof Error ? err.message : 'Failed to load house';
			loading = false;
		}
	}

	async function loadExistingRating() {
		if (!$userProfileStore.profile?.familyId || !$authStore.user || !houseId) return;

		try {
			const existing = await getRatingByUserAndHouse(
				$userProfileStore.profile.familyId,
				$authStore.user.uid,
				houseId
			);

			if (existing) {
				criteriaScores = existing.criteriaScores;
				comments = existing.comments ?? '';
			} else {
				// Initialize with default scores
				$criteriaStore.criteria.forEach((criterion) => {
					criteriaScores[criterion.id] = 0;
				});
			}
		} catch (err) {
			console.error('Error loading existing rating:', err);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!$userProfileStore.profile?.familyId || !$authStore.user || !house || !houseId) {
			error = 'Missing required data';
			return;
		}

		submitting = true;
		error = null;

		try {
			const ratingData: RatingInput = {
				familyId: $userProfileStore.profile.familyId,
				houseId,
				userId: $authStore.user.uid,
				userName: $authStore.user.displayName ?? 'Unknown',
				userPhotoUrl: $authStore.user.photoURL ?? null,
				criteriaScores,
				comments: comments || null
			};

			await createOrUpdateRating(ratingData, $criteriaStore.criteria);
			goto(`/houses/${houseId}`);
		} catch (err) {
			console.error('Error submitting rating:', err);
			error = err instanceof Error ? err.message : 'Failed to submit rating';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="rate-house-page">
	<div class="container">
		{#if loading}
			<div class="loading">Loading...</div>
		{:else if error}
			<div class="error">{error}</div>
		{:else if !house}
			<div class="error">House not found</div>
		{:else}
			<div class="page-header">
				<div>
					<h1>Rate House</h1>
					<p class="house-address">{house.address}, {house.city}</p>
				</div>
				<a href={`/houses/${houseId}`} class="btn-secondary">Cancel</a>
			</div>

			<form onsubmit={handleSubmit} class="rating-form">
				<div class="criteria-section">
					<h2>Rate Each Criterion</h2>
					<p class="section-description">Rate each aspect from -5 (poor) to +5 (excellent), with 0 as baseline/adequate</p>

					{#if $criteriaStore.loading}
						<div class="loading">Loading criteria...</div>
					{:else if $criteriaStore.criteria.length === 0}
						<div class="no-criteria">
							<p>No criteria set up yet.</p>
							<a href="/criteria" class="btn-primary">Set Up Criteria</a>
						</div>
					{:else}
						<div class="criteria-list">
							{#each $criteriaStore.criteria as criterion (criterion.id)}
								<div class="criterion-item">
									<div class="criterion-header">
										<div class="criterion-info">
											<label for={`criterion-${criterion.id}`} class="criterion-name">
												{criterion.name}
											</label>
											{#if criterion.description}
												<span class="criterion-description">{criterion.description}</span>
											{/if}
										</div>
										<div class="criterion-weight">
											Weight: {criterion.weight}/10
										</div>
									</div>

									<div class="slider-container">
										<input
											type="range"
											id={`criterion-${criterion.id}`}
											min="-5"
											max="5"
											step="1"
											bind:value={criteriaScores[criterion.id]}
											class="slider"
										/>
										<div class="slider-labels">
											<span>-5</span>
											<span class="current-score">
												{#if (criteriaScores[criterion.id] ?? 0) > 0}
													+{criteriaScores[criterion.id]}
												{:else}
													{criteriaScores[criterion.id] ?? 0}
												{/if}
											</span>
											<span>+5</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				{#if $criteriaStore.criteria.length > 0}
					<div class="comments-section">
						<h2>Additional Comments</h2>
						<textarea
							bind:value={comments}
							placeholder="Share your thoughts about this house..."
							rows="6"
							class="comments-textarea"
						></textarea>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn-primary" disabled={submitting}>
							{submitting ? 'Saving...' : 'Submit Rating'}
						</button>
						<a href={`/houses/${houseId}`} class="btn-secondary">Cancel</a>
					</div>
				{/if}
			</form>
		{/if}
	</div>
</div>

<style>
	.rate-house-page {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
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

	.house-address {
		color: var(--color-text-secondary);
		font-size: var(--font-size-lg);
	}

	.rating-form {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		box-shadow: var(--shadow-sm);
	}

	.criteria-section,
	.comments-section {
		margin-bottom: var(--spacing-xl);
	}

	h2 {
		font-size: var(--font-size-xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.section-description {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
	}

	.no-criteria {
		text-align: center;
		padding: var(--spacing-xl);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.criteria-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.criterion-item {
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
	}

	.criterion-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--spacing-md);
	}

	.criterion-info {
		flex: 1;
	}

	.criterion-name {
		display: block;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.criterion-description {
		display: block;
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.criterion-weight {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-surface);
		border-radius: var(--radius-sm);
	}

	.slider-container {
		margin-top: var(--spacing-sm);
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		background: var(--color-surface);
		outline: none;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		box-shadow: var(--shadow-sm);
	}

	.slider::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
		box-shadow: var(--shadow-sm);
	}

	.slider-labels {
		display: flex;
		justify-content: space-between;
		margin-top: var(--spacing-xs);
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.current-score {
		font-weight: 700;
		color: var(--color-primary);
		font-size: var(--font-size-lg);
	}

	.comments-textarea {
		width: 100%;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-family: inherit;
		font-size: var(--font-size-base);
		resize: vertical;
	}

	.comments-textarea:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.form-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: flex-end;
		padding-top: var(--spacing-lg);
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
		.rate-house-page {
			padding: var(--spacing-md);
		}

		.rating-form {
			padding: var(--spacing-md);
		}

		.page-header {
			flex-direction: column;
			gap: var(--spacing-md);
		}

		.criterion-header {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.form-actions {
			flex-direction: column-reverse;
		}

		.btn-primary,
		.btn-secondary {
			width: 100%;
			text-align: center;
		}
	}
</style>
