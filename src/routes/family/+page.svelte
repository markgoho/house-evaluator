<script lang="ts">
	import { familyMembersStore } from '$lib/stores/family-members-store';
</script>

<div class="family-page">
	<div class="container">
		<div class="page-header">
			<h1>Family Members</h1>
		</div>

		{#if $familyMembersStore.loading}
			<div class="loading">Loading family members...</div>
		{:else if $familyMembersStore.error}
			<div class="error">{$familyMembersStore.error}</div>
		{:else if $familyMembersStore.members.length === 0}
			<div class="empty-state">
				<div class="empty-icon">👥</div>
				<h2>No family members</h2>
				<p>Family members will appear here once they join</p>
			</div>
		{:else}
			<div class="members-grid">
				{#each $familyMembersStore.members as member (member.id)}
					<div class="member-card">
						<div class="member-photo">
							{#if member.photoUrl}
								<img src={member.photoUrl} alt={member.displayName} />
							{:else}
								<div class="photo-placeholder">
									<span class="placeholder-icon">👤</span>
								</div>
							{/if}
						</div>

						<div class="member-info">
							<h3>{member.displayName}</h3>
							<p class="email">{member.email}</p>
							<div class="role-badge" class:owner={member.role === 'owner'}>
								{member.role === 'owner' ? 'Owner' : 'Member'}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.family-page {
		padding: var(--spacing-xl);
		background: var(--color-surface);
		min-height: calc(100vh - 60px);
	}

	.page-header {
		margin-bottom: var(--spacing-xl);
	}

	h1 {
		font-size: var(--font-size-2xl);
		color: var(--color-text-primary);
	}

	.loading,
	.error {
		text-align: center;
		padding: var(--spacing-xl);
		color: var(--color-text-secondary);
	}

	.error {
		color: var(--color-error);
	}

	.empty-state {
		text-align: center;
		padding: var(--spacing-xl) * 2;
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--spacing-md);
	}

	.empty-state h2 {
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
	}

	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-md);
	}

	.member-card {
		background: white;
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
		padding: var(--spacing-lg);
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.member-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.member-photo {
		width: 100px;
		height: 100px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: var(--spacing-md);
		background: var(--color-surface);
	}

	.member-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.photo-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
	}

	.placeholder-icon {
		font-size: 3rem;
		opacity: 0.3;
	}

	.member-info {
		width: 100%;
	}

	.member-info h3 {
		font-size: var(--font-size-lg);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.email {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
		word-break: break-all;
	}

	.role-badge {
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--color-surface);
		color: var(--color-text-secondary);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.role-badge.owner {
		background: var(--color-primary);
		color: white;
	}

	@media (max-width: 768px) {
		.family-page {
			padding: var(--spacing-md);
		}

		.members-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
