<script lang="ts">
	import '../app.css';
	import Nav from '$lib/components/nav.svelte';
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let { children }: { children: any } = $props();

	// Pages that don't require authentication
	const publicPages = ['/login'];
	const isPublicPage = $derived(publicPages.includes(page.url.pathname));

	// Pages that don't require a family (setup, pending, login)
	const noFamilyAllowed = ['/setup', '/pending', '/login'];
	const requiresFamily = $derived(!noFamilyAllowed.includes(page.url.pathname));

	// Redirect to setup if user is logged in but has no family
	onMount(() => {
		const unsubscribe = userProfileStore.subscribe((state) => {
			// Wait for stores to finish loading
			if ($authStore.loading || !state.initialized) {
				return;
			}

			// If user is logged in and on a page that requires family
			if ($authStore.user && requiresFamily) {
				// No profile exists OR profile has no familyId
				if (!state.profile || state.profile.familyId === null || state.profile.familyId === undefined) {
					goto('/setup');
				}
			}
		});

		return unsubscribe;
	});
</script>

<div class="app">
	{#if $authStore.loading}
		<div class="loading-screen">
			<div class="loading-spinner"></div>
			<p>Loading...</p>
		</div>
	{:else}
		{#if !isPublicPage}
			<Nav />
		{/if}
		<main class="main-content">
			{@render children()}
		</main>
	{/if}
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.loading-screen {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		gap: var(--spacing-md);
	}

	.loading-spinner {
		width: 48px;
		height: 48px;
		border: 4px solid var(--color-surface);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.main-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
