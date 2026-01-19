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

	// Check if the current user is the family owner
	const isOwner = $derived($userProfileReady.profile?.role === 'owner');
	const familyId = $derived($userProfileReady.profile?.familyId);

	// Reactively load join requests when profile data becomes available
	// userProfileReady only emits when initialized, so no race condition
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

			// Remove from the list
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
			// Remove from the list after denying
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
		<div class="page-header">
			<h1>Family Members</h1>
		</div>

		<!-- Join Requests Section (only visible to owners) -->
		{#if isOwner && !loadingRequests && joinRequests.length > 0}
			<div class="join-requests-section">
				<h2>Pending Join Requests</h2>
				<div class="requests-list">
					{#each joinRequests as request (request.id)}
						<div class="request-card">
							<div class="request-info">
								<h3>{request.userDisplayName}</h3>
								<p class="email">{request.userEmail}</p>
								<p class="timestamp">
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
			</div>
		{/if}

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

	/* Join Requests Styles */
	.join-requests-section {
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: #fff3cd;
		border: 2px solid #ffc107;
		border-radius: var(--radius-lg);
	}

	.join-requests-section h2 {
		font-size: var(--font-size-xl);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
	}

	.requests-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.request-card {
		background: white;
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
		box-shadow: var(--shadow-sm);
	}

	.request-info h3 {
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-xs);
	}

	.request-info .email {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.request-info .timestamp {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
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
		transition: all 0.2s;
		white-space: nowrap;
	}

	.btn-approve {
		background: var(--color-success);
		color: white;
	}

	.btn-approve:hover:not(:disabled) {
		background: #28a745;
	}

	.btn-deny {
		background: var(--color-error);
		color: white;
	}

	.btn-deny:hover:not(:disabled) {
		background: #c82333;
	}

	.btn-approve:disabled,
	.btn-deny:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	@media (max-width: 768px) {
		.family-page {
			padding: var(--spacing-md);
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
		}

		.btn-approve,
		.btn-deny {
			flex: 1;
		}
	}
</style>
