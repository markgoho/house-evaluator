<script lang="ts">
	import { signInWithGoogle } from '$lib/firebase/sign-in-with-google';
	import { authStore } from '$lib/stores/auth-store';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let loading = $state(false);
	let error = $state<string | null>(null);

	// Redirect to dashboard if already logged in
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
	<div class="login-card">
		<h1>House Evaluator</h1>
		<p class="subtitle">Collaborative house rating for families</p>

		{#if error}
			<div class="error-message">
				{error}
			</div>
		{/if}

		<button class="google-sign-in-btn" onclick={handleGoogleSignIn} disabled={loading}>
			{#if loading}
				<span>Signing in...</span>
			{:else}
				<svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
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
</div>

<style>
	.login-page {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: var(--spacing-md);
	}

	.login-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
		max-width: 400px;
		width: 100%;
		box-shadow: var(--shadow-lg);
		text-align: center;
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

	.error-message {
		background: #ffebee;
		color: var(--color-error);
		padding: var(--spacing-md);
		border-radius: var(--radius-sm);
		margin-bottom: var(--spacing-md);
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
		background: white;
		font-size: var(--font-size-base);
		font-weight: 500;
		color: var(--color-text-primary);
		transition: all 0.2s;
		cursor: pointer;
	}

	.google-sign-in-btn:hover:not(:disabled) {
		background: var(--color-surface);
		box-shadow: var(--shadow-md);
	}

	.google-sign-in-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.info-text {
		margin-top: var(--spacing-lg);
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}
</style>
