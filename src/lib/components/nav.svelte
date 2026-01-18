<script lang="ts">
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { signOut } from '$lib/firebase/sign-out';
	import { page } from '$app/stores';

	async function handleSignOut() {
		try {
			await signOut();
		} catch (err) {
			console.error('Sign out error:', err);
		}
	}

	$effect(() => {
		// Automatically redirect to login if not authenticated
		if ($authStore.initialized && !$authStore.loading && !$authStore.user) {
			if ($page.url.pathname !== '/login') {
				window.location.href = '/login';
			}
		}

		// Redirect to setup if user doesn't have a family
		if (
			$authStore.user &&
			$userProfileStore.initialized &&
			!$userProfileStore.loading &&
			$userProfileStore.profile &&
			!$userProfileStore.profile.familyId
		) {
			if ($page.url.pathname !== '/setup') {
				window.location.href = '/setup';
			}
		}
	});
</script>

{#if $authStore.user}
	<nav class="navbar">
		<div class="container nav-content">
			<a href="/" class="logo">
				<span class="logo-icon">🏠</span>
				<span class="logo-text">House Evaluator</span>
			</a>

			<div class="nav-links">
				<a href="/" class:active={$page.url.pathname === '/'}>Dashboard</a>
				<a href="/houses" class:active={$page.url.pathname.startsWith('/houses')}>Houses</a>
				<a href="/criteria" class:active={$page.url.pathname === '/criteria'}>Criteria</a>
			</div>

			<div class="user-menu">
				{#if $authStore.user.photoURL}
					<img
						src={$authStore.user.photoURL}
						alt="Profile"
						class="user-avatar"
						referrerpolicy="no-referrer"
					/>
				{/if}
				<span class="user-name">{$authStore.user.displayName}</span>
				<button onclick={handleSignOut} class="sign-out-btn">Sign Out</button>
			</div>
		</div>
	</nav>
{/if}

<style>
	.navbar {
		background: white;
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: var(--shadow-sm);
	}

	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		gap: var(--spacing-lg);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-weight: 600;
		font-size: var(--font-size-lg);
		color: var(--color-primary);
		text-decoration: none;
	}

	.logo-icon {
		font-size: 1.5rem;
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-md);
		flex: 1;
		justify-content: center;
	}

	.nav-links a {
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-sm);
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 500;
		transition: all 0.2s;
	}

	.nav-links a:hover {
		background: var(--color-surface);
		color: var(--color-primary);
	}

	.nav-links a.active {
		background: var(--color-primary);
		color: white;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.user-avatar {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		object-fit: cover;
	}

	.user-name {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		display: none;
	}

	.sign-out-btn {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		background: white;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
		transition: all 0.2s;
	}

	.sign-out-btn:hover {
		background: var(--color-surface);
		color: var(--color-error);
		border-color: var(--color-error);
	}

	/* Mobile responsive */
	@media (max-width: 768px) {
		.nav-content {
			flex-wrap: wrap;
		}

		.nav-links {
			order: 3;
			width: 100%;
			justify-content: space-around;
			border-top: 1px solid var(--color-border);
			padding-top: var(--spacing-sm);
		}

		.nav-links a {
			font-size: var(--font-size-sm);
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.logo-text {
			display: none;
		}
	}

	@media (min-width: 768px) {
		.user-name {
			display: block;
		}
	}
</style>
