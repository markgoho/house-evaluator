import { describe, it, expect } from "vitest";
import { normalizeRatingScores } from "../normalize-rating-scores";
import type { Rating } from "$lib/types";

describe("normalizeRatingScores", () => {
	describe("scaleVersion: 2 ratings", () => {
		it("passes through ratings already on version 2 unchanged", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: "https://example.com/photo.jpg",
				criteriaScores: { crit1: 0, crit2: 3, crit3: 5 },
				overallScore: 2.7,
				comments: "Test comment",
				createdAt: new Date("2026-01-01"),
				updatedAt: new Date("2026-01-02"),
				scaleVersion: 2,
			};

			const result = normalizeRatingScores(rating);

			expect(result).toEqual(rating);
			expect(result.scaleVersion).toBe(2);
			expect(result.criteriaScores).toEqual({ crit1: 0, crit2: 3, crit3: 5 });
			expect(result.overallScore).toBe(2.7);
		});
	});

	describe("missing scaleVersion field", () => {
		it("triggers normalization when scaleVersion is undefined", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: "https://example.com/photo.jpg",
				criteriaScores: { crit1: -5 },
				overallScore: -5,
				comments: "Test comment",
				createdAt: new Date("2026-01-01"),
				updatedAt: new Date("2026-01-02"),
			};

			const result = normalizeRatingScores(rating);

			expect(result.scaleVersion).toBe(2);
			expect(result.criteriaScores.crit1).toBe(0);
			expect(result.overallScore).toBe(0);
		});
	});

	describe("criteriaScores normalization", () => {
		it("maps -5 → 0", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: -5 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(0);
		});

		it("maps -3 → 1", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: -3 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(1);
		});

		it("maps -1 → 2", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: -1 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(2);
		});

		it("maps 0 → 3", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: 0 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(3);
		});

		it("maps 1 → 3 (rounds 3.0)", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: 1 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(3);
		});

		it("maps 3 → 4", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: 3 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(4);
		});

		it("maps 5 → 5", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: { crit1: 5 },
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores.crit1).toBe(5);
		});
	});

	describe("overallScore normalization", () => {
		it("maps -5 → 0.0", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {},
				overallScore: -5,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.overallScore).toBe(0);
		});

		it("maps 0 → 2.5", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {},
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.overallScore).toBe(2.5);
		});

		it("maps 5 → 5.0", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {},
				overallScore: 5,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.overallScore).toBe(5);
		});

		it("maps -2.3 → 1.4 (with 1 decimal precision)", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {},
				overallScore: -2.3,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.overallScore).toBe(1.4);
		});
	});

	describe("empty criteriaScores", () => {
		it("returns empty record when criteriaScores is empty", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {},
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores).toEqual({});
			expect(result.scaleVersion).toBe(2);
		});
	});

	describe("immutability and field preservation", () => {
		it("does not mutate the input rating object", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: "https://example.com/photo.jpg",
				criteriaScores: { crit1: -5, crit2: 3 },
				overallScore: -1,
				comments: "Original comment",
				createdAt: new Date("2026-01-01"),
				updatedAt: new Date("2026-01-02"),
			};

			const originalCriteriaScores = { ...rating.criteriaScores };
			const originalOverallScore = rating.overallScore;

			normalizeRatingScores(rating);

			expect(rating.criteriaScores).toEqual(originalCriteriaScores);
			expect(rating.overallScore).toBe(originalOverallScore);
			expect(rating.scaleVersion).toBeUndefined();
		});

		it("preserves all other Rating fields unchanged", () => {
			const rating: Rating = {
				id: "rating123",
				familyId: "family456",
				houseId: "house789",
				userId: "user999",
				userName: "Jane Smith",
				userPhotoUrl: "https://example.com/jane.jpg",
				criteriaScores: { crit1: -5, crit2: 0, crit3: 5 },
				overallScore: 0,
				comments: "Great house!",
				createdAt: new Date("2026-01-10"),
				updatedAt: new Date("2026-01-15"),
			};

			const result = normalizeRatingScores(rating);

			expect(result.id).toBe("rating123");
			expect(result.familyId).toBe("family456");
			expect(result.houseId).toBe("house789");
			expect(result.userId).toBe("user999");
			expect(result.userName).toBe("Jane Smith");
			expect(result.userPhotoUrl).toBe("https://example.com/jane.jpg");
			expect(result.comments).toBe("Great house!");
			expect(result.createdAt).toEqual(new Date("2026-01-10"));
			expect(result.updatedAt).toEqual(new Date("2026-01-15"));
		});
	});

	describe("multiple criteria normalization", () => {
		it("normalizes all criteriaScores correctly", () => {
			const rating: Rating = {
				id: "rating1",
				familyId: "family1",
				houseId: "house1",
				userId: "user1",
				userName: "John Doe",
				userPhotoUrl: null,
				criteriaScores: {
					crit1: -5,
					crit2: -3,
					crit3: -1,
					crit4: 0,
					crit5: 1,
					crit6: 3,
					crit7: 5,
				},
				overallScore: 0,
				comments: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			const result = normalizeRatingScores(rating);

			expect(result.criteriaScores).toEqual({
				crit1: 0,
				crit2: 1,
				crit3: 2,
				crit4: 3,
				crit5: 3,
				crit6: 4,
				crit7: 5,
			});
		});
	});
});
