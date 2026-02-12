/**
 * Application-wide constants
 * Centralizes magic strings, numbers, and configuration values
 */

// ==================== ROUTES ====================

export const ROUTES = {
	HOME: '/',
	LOGIN: '/login',
	SETUP: '/setup',
	PENDING: '/pending',
	HOUSES: '/houses',
	HOUSES_NEW: '/houses/new',
	CRITERIA: '/criteria',
	FAMILY: '/family',
	// Dynamic routes (functions that build paths)
	houseDetail: (houseId: string) => `/houses/${houseId}`,
	houseEdit: (houseId: string) => `/houses/${houseId}/edit`,
	houseRate: (houseId: string) => `/houses/${houseId}/rate`
} as const;

// Public pages (no auth required)
export const PUBLIC_PAGES: readonly string[] = [ROUTES.LOGIN];

// Pages that don't require family membership
export const NO_FAMILY_REQUIRED_PAGES: readonly string[] = [ROUTES.SETUP, ROUTES.PENDING, ROUTES.LOGIN];

// ==================== RATING SYSTEM ====================

export const RATING = {
	MIN: 0,
	MAX: 5,
	// Descriptions
	MIN_LABEL: 'Poor',
	MAX_LABEL: 'Excellent'
} as const;

// ==================== CRITERION WEIGHTS ====================

export const CRITERION_WEIGHT = {
	MIN: 1,
	MAX: 10,
	DEFAULT: 5
} as const;

// ==================== PROPERTY VALIDATION ====================

export const PROPERTY = {
	// Year built constraints
	MIN_YEAR_BUILT: 1800,
	MAX_YEAR_BUILT: new Date().getFullYear(),

	// ZIP code
	ZIP_CODE_LENGTH: 5,
	ZIP_CODE_PATTERN: /^\d{5}$/,

	// State code
	STATE_CODE_LENGTH: 2,

	// Constraints
	MIN_BEDROOMS: 0,
	MIN_BATHROOMS: 0,
	MIN_PRICE: 1,
	MIN_SQUARE_FEET: 1,
	MIN_LOT_SIZE: 1
} as const;

// ==================== UI CONSTANTS ====================

export const UI = {
	// Form validation
	MAX_CRITERION_NAME_LENGTH: 100,
	MAX_CRITERION_DESCRIPTION_LENGTH: 500,
	MAX_RATING_COMMENTS_LENGTH: 1000,

	// Image dimensions
	HOUSE_CARD_IMAGE_HEIGHT: 200,
	HOUSE_DETAIL_IMAGE_HEIGHT: 180,

	// Grid breakpoints (matches CSS)
	BREAKPOINT_MOBILE: 767,
	BREAKPOINT_TABLET: 768,
	BREAKPOINT_DESKTOP: 1024
} as const;

// ==================== USER ROLES ====================

export const USER_ROLES = {
	OWNER: 'owner',
	MEMBER: 'member'
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
