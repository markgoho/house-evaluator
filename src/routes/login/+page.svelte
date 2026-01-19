<script lang="ts">
	import { signInWithGoogle } from '$lib/firebase/sign-in-with-google';
	import { authStore } from '$lib/stores/auth-store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state<string | null>(null);

	onMount(() => {
		if ($authStore.user) {
			goto('/');
		}
	});

	async function handleGoogleSignIn() {
		loading = true;
		error = null;

		try {
			await signInWithGoogle();
			goto('/');
		} catch (err) {
			console.error('Sign in error:', err);
			error = err instanceof Error ? err.message : 'Failed to sign in';
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-container">
		<!-- Decorative Background -->
		<div class="background-decoration" aria-hidden="true">
			<div class="decoration-shape shape-1"></div>
			<div class="decoration-shape shape-2"></div>
			<div class="decoration-shape shape-3"></div>
		</div>

		<!-- Login Card -->
		<div class="login-card">
			<div class="logo">
				<div class="logo-mark">
					<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</div>

			<h1>House Evaluator</h1>
			<p class="subtitle">Collaborative house rating for families</p>

			{#if error}
				<div class="error-message">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
						<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						<circle cx="12" cy="16" r="1" fill="currentColor"/>
					</svg>
					<span>{error}</span>
				</div>
			{/if}

			<button class="google-sign-in-btn" onclick={handleGoogleSignIn} disabled={loading}>
				{#if loading}
					<div class="btn-spinner"></div>
					<span>Signing in...</span>
				{:else}
					<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
						<path
							fill="#EA4335"
							d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
						/>
						<path
							fill="#4285F4"
							d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
						/>
						<path
							fill="#FBBC05"
							d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
						/>
						<path
							fill="#34A853"
							d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
						/>
						<path fill="none" d="M0 0h48v48H0z" />
					</svg>
					<span>Sign in with Google</span>
				{/if}
			</button>

			<p class="info-text">
				Sign in with your Google account to start rating houses with your family.
			</p>
		</div>

		<!-- Features List -->
		<div class="features">
			<div class="feature">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
						<path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Family Collaboration</h3>
					<p>Rate houses together and compare scores</p>
				</div>
			</div>
			<div class="feature">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M12 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M18 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M6 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Custom Criteria</h3>
					<p>Define what matters most to you</p>
				</div>
			</div>
			<div class="feature">
				<div class="feature-icon">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="feature-text">
					<h3>Weighted Scoring</h3>
					<p>Prioritize criteria by importance</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		padding: var(--spacing-lg);
		position: relative;
		overflow: hidden;
	}

	.login-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-2xl);
		max-width: 440px;
		width: 100%;
		position: relative;
		z-index: 1;
	}

	/* Background Decoration */
	.background-decoration {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		overflow: hidden;
	}

	.decoration-shape {
		position: absolute;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.05);
	}

	.shape-1 {
		width: 400px;
		height: 400px;
		top: -100px;
		right: -100px;
	}

	.shape-2 {
		width: 300px;
		height: 300px;
		bottom: -50px;
		left: -100px;
	}

	.shape-3 {
		width: 200px;
		height: 200px;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	/* Login Card */
	.login-card {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--spacing-2xl);
		width: 100%;
		box-shadow: var(--shadow-xl);
		text-align: center;
	}

	.logo {
		margin-bottom: var(--spacing-lg);
	}

	.logo-mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		background: var(--color-primary);
		color: white;
		border-radius: var(--radius-lg);
	}

	h1 {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.subtitle {
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.error-message {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		background: var(--color-error-light);
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-lg);
		font-size: var(--font-size-sm);
	}

	.google-sign-in-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-surface);
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-primary);
		cursor: pointer;
	}

	.google-sign-in-btn:hover:not(:disabled) {
		background: var(--color-background);
		border-color: var(--color-primary);
	}

	.google-sign-in-btn:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.btn-spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.info-text {
		margin-top: var(--spacing-lg);
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		line-height: var(--leading-relaxed);
	}

	/* Features */
	.features {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		width: 100%;
	}

	.feature {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-md);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		backdrop-filter: blur(4px);
	}

	.feature-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: rgba(255, 255, 255, 0.15);
		color: white;
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.feature-text h3 {
		font-family: var(--font-display);
		font-size: var(--font-size-base);
		font-weight: 600;
		color: white;
		margin-bottom: var(--spacing-xs);
	}

	.feature-text p {
		font-size: var(--font-size-sm);
		color: rgba(255, 255, 255, 0.8);
	}

	/* Mobile Responsive */
	@media (max-width: 480px) {
		.login-page {
			padding: var(--spacing-md);
		}

		.login-card {
			padding: var(--spacing-lg);
		}

		.logo-mark {
			width: 56px;
			height: 56px;
		}

		h1 {
			font-size: var(--font-size-xl);
		}
	}
</style>
