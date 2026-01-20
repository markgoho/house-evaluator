<script lang="ts">
	import type { Rating } from '$lib/types';
	import { ROUTES, RATING } from '$lib/constants';

	let {
		ratings,
		averageScore,
		houseId
	}: {
		ratings: Rating[];
		averageScore: number;
		houseId: string;
	} = $props();
</script>

<section class="card ratings-card">
	<h2 class="card-title">Ratings</h2>
	{#if ratings.length === 0}
		<div class="no-ratings">
			<div class="no-ratings-icon">
				<svg
					width="48"
					height="48"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<polygon
						points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</div>
			<p>No ratings yet</p>
			<span>Be the first to rate this house!</span>
			<a href={ROUTES.houseRate(houseId)} class="btn-primary">Rate Now</a>
		</div>
	{:else}
		<div class="score-display">
			<div
				class="score-badge"
				class:positive={averageScore > 0}
				class:negative={averageScore < 0}
			>
				<span class="score-value">{averageScore > 0 ? '+' : ''}{averageScore}</span>
				<span class="score-max">/ {RATING.MAX}</span>
			</div>
			<p class="score-meta">
				Average from {ratings.length} rating{ratings.length === 1 ? '' : 's'}
			</p>
		</div>

		<div class="ratings-list">
			<h3>Individual Ratings</h3>
			{#each ratings as rating}
				<div class="rating-item">
					<div class="rating-user">
						{#if rating.userPhotoUrl}
							<img src={rating.userPhotoUrl} alt={rating.userName} class="user-avatar" />
						{:else}
							<div class="avatar-placeholder">
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" />
								</svg>
							</div>
						{/if}
						<span class="user-name">{rating.userName}</span>
					</div>
					<div
						class="rating-score"
						class:positive={rating.overallScore > 0}
						class:negative={rating.overallScore < 0}
					>
						{rating.overallScore > 0 ? '+' : ''}{rating.overallScore}
					</div>
				</div>
				{#if rating.comments}
					<p class="rating-comments">{rating.comments}</p>
				{/if}
			{/each}
		</div>
	{/if}
</section>

<style>
	.card {
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
	}

	.card-title {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-border-light);
		margin-bottom: var(--spacing-lg);
	}

	.no-ratings {
		text-align: center;
		padding: var(--spacing-xl);
	}

	.no-ratings-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background: var(--color-accent-subtle);
		color: var(--color-accent);
		border-radius: var(--radius-xl);
		margin: 0 auto var(--spacing-md);
	}

	.no-ratings p {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.no-ratings span {
		display: block;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-lg);
	}

	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--font-size-sm);
		background: var(--color-primary);
		color: white;
		border: none;
		cursor: pointer;
	}

	.btn-primary:hover {
		background: var(--color-primary-dark);
		box-shadow: var(--shadow-primary);
	}

	.score-display {
		text-align: center;
		padding: var(--spacing-lg);
		background: var(--color-background);
		border-radius: var(--radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.score-badge {
		display: inline-flex;
		align-items: baseline;
		gap: var(--spacing-xs);
	}

	.score-value {
		font-family: var(--font-display);
		font-size: var(--font-size-4xl);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.score-badge.positive .score-value {
		color: var(--color-success);
	}

	.score-badge.negative .score-value {
		color: var(--color-error);
	}

	.score-max {
		font-size: var(--font-size-lg);
		color: var(--color-text-muted);
	}

	.score-meta {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-sm);
	}

	.ratings-list h3 {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
	}

	.rating-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md);
		background: var(--color-background);
		border-radius: var(--radius-md);
		margin-bottom: var(--spacing-sm);
	}

	.rating-user {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.user-avatar {
		width: 36px;
		height: 36px;
		border-radius: var(--radius-full);
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 36px;
		height: 36px;
		background: var(--color-border-light);
		border-radius: var(--radius-full);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.user-name {
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.rating-score {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.rating-score.positive {
		color: var(--color-success);
	}

	.rating-score.negative {
		color: var(--color-error);
	}

	.rating-comments {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		line-height: var(--leading-relaxed);
	}
</style>
