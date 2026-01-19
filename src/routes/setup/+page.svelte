<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { createOrUpdateUser } from '$lib/services/user-service';
	import { getFamily } from '$lib/services/family-service';
	import { createJoinRequest } from '$lib/services/join-request-service';
	import type { UserInput } from '$lib/types';

	let familyId = $state('');
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
				role: 'member'
			};

			await createOrUpdateUser($authStore.user.uid, userData);
		} catch (err) {
			console.error('Error creating user profile:', err);
		}
	}

	async function handleJoinFamily(event: Event): Promise<void> {
		event.preventDefault();

		if (!$authStore.user) {
			error = 'Not authenticated';
			return;
		}

		loading = true;
		error = null;

		try {
			// Verify family exists
			const family = await getFamily(familyId);

			if (!family) {
				error = 'Family not found. Please check the Family ID and try again.';
				return;
			}

			// Create a join request instead of directly joining
			await createJoinRequest({
				familyId,
				userId: $authStore.user.uid,
				userEmail: $authStore.user.email ?? '',
				userDisplayName: $authStore.user.displayName ?? '',
				userPhotoUrl: $authStore.user.photoURL ?? null
			});

			// Show success message
			error = null;
			alert(
				`Join request sent! The family owner (${family.name}) will need to approve your request before you can access the family data.`
			);

			// Redirect to a pending page or home
			goto('/pending');
		} catch (error_) {
			console.error('Error creating join request:', error_);
			error = error_ instanceof Error ? error_.message : 'Failed to create join request';
		} finally {
			loading = false;
		}
	}
</script>

<div class="setup-page">
	<div class="setup-card">
		<h1>Welcome to House Evaluator!</h1>
		<p class="subtitle">Join your family to get started</p>

		{#if error}
			<div class="error-message">{error}</div>
		{/if}

		<form onsubmit={handleJoinFamily} class="setup-form">
			<div class="form-field">
				<label for="familyId">Family ID *</label>
				<input
					type="text"
					id="familyId"
					bind:value={familyId}
					required
					placeholder="Paste the Family ID here"
				/>
				<p class="field-hint">Paste the Firestore document ID for your family</p>
			</div>

			<button type="submit" class="btn-primary" disabled={loading}>
				{loading ? 'Sending Request...' : 'Request to Join'}
			</button>
		</form>

		<div class="info-box">
			<h3>Where to find your Family ID</h3>
			<ul>
				<li>Open the Firebase Console</li>
				<li>Navigate to Firestore Database</li>
				<li>Find your family in the "families" collection</li>
				<li>Copy the document ID</li>
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
