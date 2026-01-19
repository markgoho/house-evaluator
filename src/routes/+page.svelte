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
				<div class="stat-card">
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
				</div>

				<div class="stat-card">
					<div class="stat-icon accent">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="stat-content">
						<span class="stat-value">0</span>
						<span class="stat-label">Ratings</span>
					</div>
				</div>

				<div class="stat-card">
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
				</div>
			</div>
		</section>

		<!-- Quick Actions -->
		<section class="actions-section">
			<h2 class="section-title">Quick Actions</h2>
			<div class="actions-grid">
				<a href="/houses/new" class="action-card featured">
					<div class="action-icon-wrapper">
						<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 5V19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M5 12H19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="action-content">
						<h3>Add House</h3>
						<p>Add a new property to evaluate</p>
					</div>
					<span class="action-arrow">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				</a>

				<a href="/houses" class="action-card">
					<div class="action-icon-wrapper secondary">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</div>
					<div class="action-content">
						<h3>View Houses</h3>
						<p>See all properties you're considering</p>
					</div>
					<span class="action-arrow">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
				</a>

				<a href="/criteria" class="action-card">
					<div class="action-icon-wrapper secondary">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
							<path d="M12 1V4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M12 20V23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M4.22 4.22L6.34 6.34" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M17.66 17.66L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M1 12H4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M20 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M4.22 19.78L6.34 17.66" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							<path d="M17.66 6.34L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
						</svg>
					</div>
					<div class="action-content">
						<h3>Manage Criteria</h3>
						<p>Customize your rating criteria</p>
					</div>
					<span class="action-arrow">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							<path d="M12 5L19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
					</span>
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
		grid-template-columns: repeat(3, 1fr);
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

	.stat-icon.accent {
		background: var(--color-accent-subtle);
		color: var(--color-accent);
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

	/* Actions Section */
	.actions-section {
		margin-top: var(--spacing-xl);
	}

	.section-title {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-lg);
	}

	.actions-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.action-card {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		text-decoration: none;
	}

	.action-card:hover {
		border-color: var(--color-primary);
		box-shadow: var(--shadow-md);
	}

	.action-card.featured {
		background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
		border-color: transparent;
		color: white;
	}

	.action-card.featured:hover {
		box-shadow: var(--shadow-primary);
	}

	.action-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52px;
		height: 52px;
		background: rgba(255, 255, 255, 0.2);
		color: white;
		border-radius: var(--radius-md);
		flex-shrink: 0;
	}

	.action-icon-wrapper.secondary {
		background: var(--color-primary-subtle);
		color: var(--color-primary);
	}

	.action-content {
		flex: 1;
	}

	.action-card h3 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin-bottom: var(--spacing-xs);
	}

	.action-card.featured h3 {
		color: white;
	}

	.action-card:not(.featured) h3 {
		color: var(--color-text-primary);
	}

	.action-card p {
		font-size: var(--font-size-sm);
		margin: 0;
	}

	.action-card.featured p {
		color: rgba(255, 255, 255, 0.85);
	}

	.action-card:not(.featured) p {
		color: var(--color-text-secondary);
	}

	.action-arrow {
		color: rgba(255, 255, 255, 0.7);
		flex-shrink: 0;
	}

	.action-card:not(.featured) .action-arrow {
		color: var(--color-text-muted);
	}

	.action-card:hover .action-arrow {
		color: var(--color-primary);
	}

	.action-card.featured:hover .action-arrow {
		color: white;
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

		.actions-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
