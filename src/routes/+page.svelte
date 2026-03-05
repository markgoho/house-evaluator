<script lang="ts">
	import { authStore } from '$lib/stores/auth-store';
	import { housesStore } from '$lib/stores/houses-store';
	import { criteriaStore } from '$lib/stores/criteria-store';

	const firstName = $derived($authStore.user?.displayName?.split(' ')[0] ?? 'there');
	const houseCount = $derived($housesStore.houses.length);
	const criteriaCount = $derived($criteriaStore.criteria.length);
</script>

<div class="dashboard">
	<div class="container">
		<!-- Hero Section -->
		<section class="hero">
			<div class="hero-content">
				<p class="hero-eyebrow">Welcome back</p>
				<h1 class="hero-title">{firstName}</h1>
				<p class="hero-subtitle">Let's find your perfect home together</p>
			</div>
			<div class="hero-decoration" aria-hidden="true">
				<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M60 10L110 45V110H70V75H50V110H10V45L60 10Z" fill="var(--color-primary-subtle)" stroke="var(--color-primary)" stroke-width="2"/>
					<rect x="45" y="50" width="30" height="20" rx="2" fill="var(--color-accent-subtle)" stroke="var(--color-accent)" stroke-width="1.5"/>
				</svg>
			</div>
		</section>

		<!-- Stats Grid -->
		<section class="stats-section">
			<div class="stats-grid">
				<a href="/houses" class="stat-card">
					<div class="stat-icon">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M9 21V12H15V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{houseCount}</span>
						<span class="stat-label">Houses</span>
					</div>
				</a>

				<a href="/criteria" class="stat-card">
					<div class="stat-icon muted">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 20V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M18 20V4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M6 20V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">{criteriaCount}</span>
						<span class="stat-label">Criteria</span>
					</div>
				</a>
			</div>
		</section>
	</div>
</div>

<style>
	.dashboard {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	/* Hero Section */
	.hero {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-2xl) var(--spacing-xl);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-xl);
	}

	.hero-content {
		flex: 1;
	}

	.hero-eyebrow {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-accent);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: var(--spacing-xs);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: var(--font-size-4xl);
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.1;
		margin-bottom: var(--spacing-sm);
	}

	.hero-subtitle {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
	}

	.hero-decoration {
		display: none;
		opacity: 0.8;
	}

	@media (min-width: 768px) {
		.hero-decoration {
			display: block;
		}
	}

	/* Stats Section */
	.stats-section {
		margin-bottom: var(--spacing-xl);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md);
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		text-decoration: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.stat-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.stat-icon.muted {
		background: var(--color-border-light);
		color: var(--color-text-secondary);
	}

	.stat-content {
		display: flex;
		flex-direction: column;
	}

	.stat-value {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-top: var(--spacing-xs);
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.dashboard {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}

		.hero {
			padding: var(--spacing-lg);
			border-radius: var(--radius-lg);
		}

		.hero-title {
			font-size: var(--font-size-2xl);
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.stat-card {
			padding: var(--spacing-md);
		}
	}
</style>
