<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { getUserJoinRequests } from '$lib/services/join-request-service';
	import type { JoinRequest } from '$lib/types';

	let pendingRequests = $state<JoinRequest[]>([]);
	let loading = $state(true);

	onMount(async () => {
		// If user already has a family, redirect to home
		if ($userProfileStore.profile?.familyId) {
			goto('/');
			return;
		}

		// Load user's join requests
		if ($authStore.user) {
			try {
				const requests = await getUserJoinRequests($authStore.user.uid);
				// Filter for pending requests only
				pendingRequests = requests.filter((request) => request.status === 'pending');
			} catch (error) {
				console.error('Error loading join requests:', error);
			} finally {
				loading = false;
			}
		}
	});

	// Periodically check if user profile has been updated with familyId
	// This handles the case where the owner approved the request
	$effect(() => {
		if ($userProfileStore.profile?.familyId) {
			goto('/');
		}
	});

	function handleBackToSetup(): void {
		goto('/setup');
	}
</script>

<div class="pending-page">
	<div class="pending-card">
		{#if loading}
			<div class="loading-spinner"></div>
			<p>Loading your join requests...</p>
		{:else if pendingRequests.length > 0}
			<div class="status-icon">⏳</div>
			<h1>Join Request Pending</h1>
			<p class="subtitle">Your request to join a family is waiting for approval</p>

			<div class="requests-list">
				{#each pendingRequests as request (request.id)}
					<div class="request-card">
						<h3>Requested on {new Date(request.createdAt).toLocaleDateString()}</h3>
						<p class="request-status">Status: <span class="status-badge">Pending</span></p>
						<p class="info-text">
							The family owner will review your request and approve or deny it. You'll be able to
							access the family once your request is approved.
						</p>
					</div>
				{/each}
			</div>

			<p class="help-text">
				You can close this page and check back later. You'll be automatically redirected once
				approved.
			</p>
		{:else}
			<div class="status-icon">ℹ️</div>
			<h1>No Pending Requests</h1>
			<p class="subtitle">You don't have any pending join requests</p>

			<button class="btn-primary" onclick={handleBackToSetup}>Go to Setup</button>
		{/if}
	</div>
</div>

<style>
	.pending-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: var(--spacing-md);
	}

	.pending-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		max-width: 600px;
		width: 100%;
		box-shadow: var(--shadow-lg);
		text-align: center;
	}

	.status-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-md);
	}

	h1 {
		color: var(--color-primary);
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-sm);
	}

	.subtitle {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-surface);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto var(--spacing-md);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.requests-list {
		margin-bottom: var(--spacing-xl);
	}

	.request-card {
		background: var(--color-surface);
		padding: var(--spacing-lg);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-md);
		text-align: left;
	}

	.request-card h3 {
		color: var(--color-text-primary);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-sm);
	}

	.request-status {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.status-badge {
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-sm);
		background: #fff3cd;
		color: #856404;
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.info-text {
		color: var(--color-text-secondary);
		line-height: 1.5;
	}

	.help-text {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-style: italic;
		padding: var(--spacing-md);
		background: var(--color-surface);
		border-radius: var(--radius-md);
	}

	.btn-primary {
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-primary);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		margin-top: var(--spacing-md);
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
	}
</style>
