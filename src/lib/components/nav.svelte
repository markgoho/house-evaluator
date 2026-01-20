<script lang="ts">
	import { authStore } from '$lib/stores/auth-store';
	import { userProfileStore } from '$lib/stores/user-profile-store';
	import { signOut } from '$lib/firebase/sign-out';
	import { page } from '$app/state';

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
			if (page.url.pathname !== '/login') {
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
			if (page.url.pathname !== '/setup') {
				window.location.href = '/setup';
			}
		}
	});
</script>

{#if $authStore.user}
	<nav class="navbar">
		<div class="container nav-content">
			<a href="/" class="logo">
				<span class="logo-mark">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</span>
				<span class="logo-text">House Evaluator</span>
			</a>

			<div class="nav-links">
				<a href="/" class="nav-link" class:active={page.url.pathname === '/'}>
					<span class="nav-link-text">Dashboard</span>
				</a>
				<a href="/houses" class="nav-link" class:active={page.url.pathname.startsWith('/houses')}>
					<span class="nav-link-text">Houses</span>
				</a>
				<a href="/criteria" class="nav-link" class:active={page.url.pathname === '/criteria'}>
					<span class="nav-link-text">Criteria</span>
				</a>
				<a href="/family" class="nav-link" class:active={page.url.pathname === '/family'}>
					<span class="nav-link-text">Family</span>
				</a>
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
				<div class="user-info">
					<span class="user-name">{$authStore.user.displayName}</span>
				</div>
				<button onclick={handleSignOut} class="sign-out-btn">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Sign Out</span>
				</button>
			</div>
		</div>
	</nav>
{/if}

<style>
	.navbar {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	.nav-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-lg);
		gap: var(--spacing-xl);
	}

	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		text-decoration: none;
		color: var(--color-primary);
	}

	.logo-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-md);
	}

	.logo-text {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.nav-links {
		display: flex;
		gap: var(--spacing-xs);
		flex: 1;
		justify-content: center;
	}

	.nav-link {
		position: relative;
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--color-text-secondary);
		font-weight: 500;
		font-size: var(--font-size-sm);
	}

	.nav-link:hover {
		background: var(--color-primary-subtle);
		color: var(--color-primary);
	}

	.nav-link.active {
		background: var(--color-primary);
		color: white;
	}

	.nav-link.active:hover {
		background: var(--color-primary-dark);
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		object-fit: cover;
		border: 2px solid var(--color-border);
	}

	.user-info {
		display: none;
	}

	.user-name {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.sign-out-btn {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-md);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.sign-out-btn:hover {
		background: var(--color-error-light);
		color: var(--color-error);
		border-color: var(--color-error);
	}

	.sign-out-btn span {
		display: none;
	}

	/* Tablet and up */
	@media (min-width: 768px) {
		.user-info {
			display: block;
		}

		.sign-out-btn span {
			display: inline;
		}
	}

	/* Mobile responsive */
	@media (max-width: 767px) {
		.nav-content {
			flex-wrap: wrap;
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.nav-links {
			order: 3;
			width: 100%;
			justify-content: space-around;
			border-top: 1px solid var(--color-border-light);
			padding-top: var(--spacing-sm);
			margin-top: var(--spacing-sm);
			gap: 0;
		}

		.nav-link {
			font-size: var(--font-size-xs);
			padding: var(--spacing-xs) var(--spacing-sm);
		}

		.logo-text {
			display: none;
		}
	}
</style>
