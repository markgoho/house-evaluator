export type JoinRequestStatus = 'pending' | 'approved' | 'denied';

export interface JoinRequest {
	id: string;
	userId: string;
	familyId: string;
	status: JoinRequestStatus;
	userEmail: string;
	userDisplayName: string;
	createdAt: Date;
	updatedAt: Date;
}

export type JoinRequestInput = Omit<JoinRequest, 'id' | 'createdAt' | 'updatedAt'>;
