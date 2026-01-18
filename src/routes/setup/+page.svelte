<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { createOrUpdateUser } from '$lib/services/user-service';
	import { createFamily } from '$lib/services/family-service';
	import type { UserInput, FamilyInput } from '$lib/types';

	let familyName = $state('');
	let loading = $state(false);
	let error = $state<string | null>(null);

	onMount(async () => {
		// Redirect if user already has a family
		if ($userProfileStore.profile?.familyId) {
			goto('/');
		}

		// Create user profile if it doesn't exist
		if ($authStore.user && !$userProfileStore.profile) {
			await createInitialUserProfile();
		}
	});

	async function createInitialUserProfile() {
		if (!$authStore.user) return;

		try {
			const userData: UserInput = {
				email: $authStore.user.email ?? '',
				displayName: $authStore.user.displayName ?? '',
				photoUrl: $authStore.user.photoURL ?? null,
				familyId: null,
				role: 'owner'
			};

			await createOrUpdateUser($authStore.user.uid, userData);
		} catch (err) {
			console.error('Error creating user profile:', err);
		}
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!$authStore.user) {
			error = 'Not authenticated';
			return;
		}

		loading = true;
		error = null;

		try {
			// Create family
			const familyData: FamilyInput = {
				name: familyName,
				ownerId: $authStore.user.uid,
				memberIds: [$authStore.user.uid]
			};

			const familyId = await createFamily(familyData);

			// Update user profile with familyId
			await createOrUpdateUser($authStore.user.uid, {
				email: $authStore.user.email ?? '',
				displayName: $authStore.user.displayName ?? '',
				photoUrl: $authStore.user.photoURL ?? null,
				familyId,
				role: 'owner'
			});

			// Redirect to dashboard
			goto('/');
		} catch (err) {
			console.error('Error creating family:', err);
			error = err instanceof Error ? err.message : 'Failed to create family';
		} finally {
			loading = false;
		}
	}
</script>

<div class="setup-page">
	<div class="setup-card">
		<h1>Welcome to House Evaluator!</h1>
		<p class="subtitle">Let's get you set up</p>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form onsubmit={handleSubmit} class="setup-form">
			<div class="form-field">
				<label for="familyName">Family Name *</label>
				<input
					type="text"
					id="familyName"
					bind:value={familyName}
					required
					placeholder="The Smith Family"
					autofocus
				/>
				<p class="field-hint">This will be shared with everyone you invite to rate houses</p>
			</div>

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Creating...' : 'Create Family'}
			</button>
		</form>

		<div class="info-box">
			<h3>What happens next?</h3>
			<ul>
				<li>Your family group will be created</li>
				<li>Default rating criteria will be set up</li>
				<li>You can start adding houses to evaluate</li>
				<li>Invite family members to collaborate</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.setup-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: var(--spacing-md);
	}

	.setup-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		max-width: 500px;
		width: 100%;
		box-shadow: var(--shadow-lg);
	}

	h1 {
		color: var(--color-primary);
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-sm);
		text-align: center;
	}

	.subtitle {
		color: var(--color-text-secondary);
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.error-message {
		background: #ffebee;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-md);
	}

	.setup-form {
		margin-bottom: var(--spacing-xl);
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

	input {
		width: 100%;
		padding: var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		transition: border-color 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.field-hint {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-top: var(--spacing-xs);
	}

	.btn-primary {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn-primary:hover:not(:disabled) {
		background: var(--color-primary-dark);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.info-box {
		background: var(--color-surface);
		padding: var(--spacing-lg);
		border-radius: var(--radius-md);
	}

	.info-box h3 {
		color: var(--color-text-primary);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
	}

	.info-box ul {
		list-style: none;
		padding: 0;
	}

	.info-box li {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-sm);
		padding-left: var(--spacing-lg);
		position: relative;
	}

	.info-box li::before {
		content: '✓';
		position: absolute;
		left: 0;
		color: var(--color-success);
		font-weight: bold;
	}
</style>
