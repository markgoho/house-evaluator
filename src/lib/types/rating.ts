export interface Rating {
  id: string;
  familyId: string;
  houseId: string;
  userId: string;
  userName: string; // denormalized for easier display
  userPhotoUrl: string | null; // denormalized for easier display
  // Criteria scores: criterionId -> score (1-10)
  criteriaScores: Record<string, number>;
  // Weighted average (auto-calculated)
  overallScore: number;
  comments: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type RatingInput = Omit<
  Rating,
  "id" | "overallScore" | "createdAt" | "updatedAt"
>;
export type RatingUpdate = Partial<
  Omit<RatingInput, "houseId" | "userId" | "familyId">
>;
