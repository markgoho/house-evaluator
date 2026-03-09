import { describe, it, expect } from "vitest";
import { calculateMonthlyCost } from "../calculate-monthly-cost";
import type { MortgageSettings } from "$lib/types";
import type { TaxRateEntry } from "$lib/config/tax-rates";

const DEFAULT_SETTINGS: MortgageSettings = {
	downPaymentPercent: 20,
	mortgageRatePercent: 6.5,
	loanTermYears: 30
};

const SAMPLE_TAX_RATES: TaxRateEntry = {
	town: "Penfield",
	county: "Monroe",
	state: "NY",
	countyTaxRate: 9.54,
	townTaxRate: 2.85,
	schoolTaxRate: 22.5,
	schoolDistrict: "Penfield"
};

describe("calculateMonthlyCost", () => {
	it("calculates correct down payment and loan amount", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: undefined
		});

		expect(result.downPayment).toBe(60_000);
		expect(result.loanAmount).toBe(240_000);
	});

	it("calculates principal and interest using standard amortization", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: undefined
		});

		// $240,000 loan at 6.5% for 30 years ≈ $1,517/month P&I
		expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(1500);
		expect(result.monthlyPrincipalAndInterest).toBeLessThan(1530);
	});

	it("handles zero interest rate", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: {
				downPaymentPercent: 20,
				mortgageRatePercent: 0,
				loanTermYears: 30
			},
			taxRates: undefined
		});

		// $240,000 / 360 payments = $666.67/month
		expect(result.monthlyPrincipalAndInterest).toBeCloseTo(666.67, 1);
	});

	it("calculates property and school taxes when rates and assessed value provided", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: 200_000,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: SAMPLE_TAX_RATES
		});

		// Annual property tax: (200,000/1000) * (9.54 + 2.85) = 200 * 12.39 = $2,478
		expect(result.annualPropertyTax).toBeCloseTo(2478, 0);
		expect(result.monthlyPropertyTax).toBeCloseTo(2478 / 12, 0);

		// Annual school tax: (200,000/1000) * 22.5 = 200 * 22.5 = $4,500
		expect(result.annualSchoolTax).toBe(4500);
		expect(result.monthlySchoolTax).toBeCloseTo(4500 / 12, 0);
	});

	it("excludes taxes when assessed value is undefined", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: SAMPLE_TAX_RATES
		});

		expect(result.monthlyPropertyTax).toBe(0);
		expect(result.monthlySchoolTax).toBe(0);
		expect(result.annualPropertyTax).toBe(0);
		expect(result.annualSchoolTax).toBe(0);
	});

	it("excludes taxes when tax rates are undefined", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: 200_000,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: undefined
		});

		expect(result.monthlyPropertyTax).toBe(0);
		expect(result.monthlySchoolTax).toBe(0);
	});

	it("calculates correct total monthly payment with all components", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: 200_000,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: SAMPLE_TAX_RATES
		});

		const expectedTotal =
			result.monthlyPrincipalAndInterest +
			result.monthlyPropertyTax +
			result.monthlySchoolTax;

		expect(result.totalMonthlyPayment).toBeCloseTo(expectedTotal, 1);
	});

	it("handles 15-year loan term", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: {
				...DEFAULT_SETTINGS,
				loanTermYears: 15
			},
			taxRates: undefined
		});

		// 15-year P&I should be higher than 30-year
		const thirtyYearResult = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: DEFAULT_SETTINGS,
			taxRates: undefined
		});

		expect(result.monthlyPrincipalAndInterest).toBeGreaterThan(
			thirtyYearResult.monthlyPrincipalAndInterest
		);
	});

	it("handles 100% down payment", () => {
		const result = calculateMonthlyCost({
			price: 300_000,
			taxAssessedValue: undefined,
			mortgageSettings: {
				downPaymentPercent: 100,
				mortgageRatePercent: 6.5,
				loanTermYears: 30
			},
			taxRates: undefined
		});

		expect(result.downPayment).toBe(300_000);
		expect(result.loanAmount).toBe(0);
		expect(result.monthlyPrincipalAndInterest).toBe(0);
	});
});
