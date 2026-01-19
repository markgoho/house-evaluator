export interface Family {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type FamilyInput = Omit<Family, "id" | "createdAt" | "updatedAt">;
