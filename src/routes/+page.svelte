<script lang="ts">
	import { authStore } from '$lib/stores/auth-store';
</script>

<div class="dashboard">
	<div class="container">
		<div class="welcome">
			<h1>Welcome back, {$authStore.user?.displayName?.split(' ')[0] ?? 'there'}!</h1>
			<p class="subtitle">Let's find your perfect home together</p>
		</div>

		<div class="quick-stats">
			<div class="stat-card">
				<div class="stat-value">0</div>
				<div class="stat-label">Houses</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">0</div>
				<div class="stat-label">Ratings</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">0</div>
				<div class="stat-label">Criteria</div>
			</div>
		</div>

		<div class="action-cards">
			<a href="/houses/new" class="action-card primary">
				<div class="action-icon">➕</div>
				<h3>Add House</h3>
				<p>Add a new property to evaluate</p>
			</a>
			<a href="/houses" class="action-card">
				<div class="action-icon">🏘️</div>
				<h3>View Houses</h3>
				<p>See all properties you're considering</p>
			</a>
			<a href="/criteria" class="action-card">
				<div class="action-icon">⚙️</div>
				<h3>Manage Criteria</h3>
				<p>Customize your rating criteria</p>
			</a>
		</div>
	</div>
</div>

<style>
	.dashboard {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.welcome {
		margin-bottom: var(--spacing-xl);
	}

	h1 {
		color: var(--color-text-primary);
		font-size: var(--font-size-2xl);
		margin-bottom: var(--spacing-sm);
	}

	.subtitle {
		color: var(--color-text-secondary);
		font-size: var(--font-size-lg);
	}

	.quick-stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
	}

	.stat-card {
		background: white;
		padding: var(--spacing-lg);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		text-align: center;
	}

	.stat-value {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--color-primary);
		margin-bottom: var(--spacing-xs);
	}

	.stat-label {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.action-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}

	.action-card {
		background: white;
		padding: var(--spacing-lg);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		transition: all 0.2s;
		border: 2px solid transparent;
	}

	.action-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-primary);
	}

	.action-card.primary {
		background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
		color: white;
	}

	.action-card.primary h3,
	.action-card.primary p {
		color: white;
	}

	.action-icon {
		font-size: 2.5rem;
		margin-bottom: var(--spacing-md);
	}

	.action-card h3 {
		color: var(--color-text-primary);
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-sm);
	}

	.action-card p {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: var(--spacing-md);
		}

		.action-cards {
			grid-template-columns: 1fr;
		}
	}
</style>
