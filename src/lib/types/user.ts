export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl: string | null;
  familyId: string | null;
  role: "owner" | "member";
  createdAt: Date;
  updatedAt: Date;
}

export type UserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
