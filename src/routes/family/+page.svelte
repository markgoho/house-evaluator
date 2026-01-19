<script lang="ts">
	import { familyMembersStore } from '$lib/stores/family-members-store';
	import { userProfileReady } from '$lib/stores/user-profile-store';
	import {
		getFamilyJoinRequests,
		deleteJoinRequest
	} from '$lib/services/join-request-service';
	import { approveJoinRequest, denyJoinRequest } from '$lib/services/family-service';
	import type { JoinRequest } from '$lib/types';

	let joinRequests = $state<JoinRequest[]>([]);
	let loadingRequests = $state(false);
	let processingRequestId = $state<string | null>(null);

	const isOwner = $derived($userProfileReady.profile?.role === 'owner');
	const familyId = $derived($userProfileReady.profile?.familyId);

	$effect(() => {
		if (familyId && isOwner) {
			loadJoinRequests();
		}
	});

	async function loadJoinRequests() {
		if (!familyId || !isOwner) return;

		loadingRequests = true;
		try {
			joinRequests = await getFamilyJoinRequests(familyId);
		} catch (err) {
			console.error('Error loading join requests:', err);
		} finally {
			loadingRequests = false;
		}
	}

	async function handleApprove(request: JoinRequest) {
		if (!familyId) return;

		processingRequestId = request.id;
		try {
			await approveJoinRequest(
				request.id,
				familyId,
				request.userId,
				request.userEmail,
				request.userDisplayName,
				request.userPhotoUrl
			);

			await deleteJoinRequest(request.id);
			joinRequests = joinRequests.filter((r) => r.id !== request.id);
		} catch (err) {
			console.error('Error approving request:', err);
			alert('Failed to approve request. Please try again.');
		} finally {
			processingRequestId = null;
		}
	}

	async function handleDeny(request: JoinRequest) {
		processingRequestId = request.id;
		try {
			await denyJoinRequest(request.id);
			await deleteJoinRequest(request.id);
			joinRequests = joinRequests.filter((r) => r.id !== request.id);
		} catch (err) {
			console.error('Error denying request:', err);
			alert('Failed to deny request. Please try again.');
		} finally {
			processingRequestId = null;
		}
	}
</script>

<div class="family-page">
	<div class="container">
		<header class="page-header">
			<h1>Family Members</h1>
			<p class="header-subtitle">People collaborating on house evaluations</p>
		</header>

		<!-- Join Requests Section -->
		{#if isOwner && !loadingRequests && joinRequests.length > 0}
			<section class="requests-section">
				<div class="requests-header">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
						<path d="M20 8V14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M23 11H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<h2>Pending Join Requests</h2>
				</div>
				<div class="requests-list">
					{#each joinRequests as request (request.id)}
						<div class="request-card">
							<div class="request-info">
								<h3>{request.userDisplayName}</h3>
								<p class="request-email">{request.userEmail}</p>
								<p class="request-date">
									Requested {new Date(request.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div class="request-actions">
								<button
									class="btn-approve"
									onclick={() => handleApprove(request)}
									disabled={processingRequestId !== null}
								>
									{processingRequestId === request.id ? 'Approving...' : 'Approve'}
								</button>
								<button
									class="btn-deny"
									onclick={() => handleDeny(request)}
									disabled={processingRequestId !== null}
								>
									{processingRequestId === request.id ? 'Denying...' : 'Deny'}
								</button>
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<!-- Members Grid -->
		{#if $familyMembersStore.loading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Loading family members...</p>
			</div>
		{:else if $familyMembersStore.error}
			<div class="error-state">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
					<path d="M12 8V12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
					<circle cx="12" cy="16" r="1" fill="currentColor"/>
				</svg>
				<p>{$familyMembersStore.error}</p>
			</div>
		{:else if $familyMembersStore.members.length === 0}
			<div class="empty-state">
				<div class="empty-illustration">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						<circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5"/>
						<path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<h2>No family members</h2>
				<p>Family members will appear here once they join</p>
			</div>
		{:else}
			<div class="members-grid">
				{#each $familyMembersStore.members as member (member.id)}
					<div class="member-card">
						<div class="member-avatar">
							{#if member.photoUrl}
								<img src={member.photoUrl} alt={member.displayName} />
							{:else}
								<div class="avatar-placeholder">
									<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
										<circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
									</svg>
								</div>
							{/if}
						</div>

						<div class="member-info">
							<h3>{member.displayName}</h3>
							<p class="member-email">{member.email}</p>
							<span class="role-badge" class:owner={member.role === 'owner'}>
								{member.role === 'owner' ? 'Owner' : 'Member'}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.family-page {
		min-height: calc(100vh - 70px);
		padding: var(--spacing-xl) 0 var(--spacing-3xl);
	}

	.page-header {
		margin-bottom: var(--spacing-xl);
	}

	.page-header h1 {
		font-family: var(--font-display);
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.header-subtitle {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
	}

	/* Loading & Error States */
	.loading-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		text-align: center;
		color: var(--color-text-secondary);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-state {
		color: var(--color-error);
	}

	.error-state svg {
		margin-bottom: var(--spacing-md);
		opacity: 0.6;
	}

	/* Empty State */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-3xl);
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-xl);
		text-align: center;
	}

	.empty-illustration {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100px;
		height: 100px;
		background: var(--color-primary-subtle);
		color: var(--color-primary);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-lg);
	}

	.empty-state h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-sm);
	}

	.empty-state p {
		color: var(--color-text-secondary);
	}

	/* Join Requests Section */
	.requests-section {
		background: var(--color-warning-light);
		border: 1px solid var(--color-warning);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.requests-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--color-warning);
		margin-bottom: var(--spacing-lg);
	}

	.requests-header h2 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.requests-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.request-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
		background: var(--color-surface);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-sm);
	}

	.request-info h3 {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.request-email {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.request-date {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-style: italic;
	}

	.request-actions {
		display: flex;
		gap: var(--spacing-sm);
		flex-shrink: 0;
	}

	.btn-approve,
	.btn-deny {
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-sm);
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
	}

	.btn-approve {
		background: var(--color-success);
		color: white;
	}

	.btn-approve:hover:not(:disabled) {
		background: var(--color-success);
		filter: brightness(0.95);
	}

	.btn-deny {
		background: var(--color-surface);
		color: var(--color-error);
		border: 1px solid var(--color-error);
	}

	.btn-deny:hover:not(:disabled) {
		background: var(--color-error);
		color: white;
	}

	.btn-approve:disabled,
	.btn-deny:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Members Grid */
	.members-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
		gap: var(--spacing-lg);
	}

	.member-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		background: var(--color-surface);
		border: 1px solid var(--color-border-light);
		border-radius: var(--radius-lg);
		padding: var(--spacing-xl);
	}

	.member-card:hover {
		border-color: var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.member-avatar {
		width: 80px;
		height: 80px;
		border-radius: var(--radius-full);
		overflow: hidden;
		margin-bottom: var(--spacing-md);
		background: var(--color-background);
	}

	.member-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-muted);
	}

	.member-info h3 {
		font-family: var(--font-display);
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.member-email {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-md);
		word-break: break-all;
	}

	.role-badge {
		display: inline-block;
		padding: var(--spacing-xs) var(--spacing-md);
		background: var(--color-border-light);
		color: var(--color-text-secondary);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.role-badge.owner {
		background: var(--color-primary);
		color: white;
	}

	/* Mobile Responsive */
	@media (max-width: 767px) {
		.family-page {
			padding: var(--spacing-md) 0 var(--spacing-xl);
		}

		.members-grid {
			grid-template-columns: 1fr;
		}

		.request-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.request-actions {
			width: 100%;
			margin-top: var(--spacing-md);
		}

		.btn-approve,
		.btn-deny {
			flex: 1;
		}
	}
</style>
