import type { TaxRateEntry } from "$lib/config/tax-rates";
import type { MortgageSettings } from "$lib/types";

export interface MonthlyCostBreakdown {
	loanAmount: number;
	downPayment: number;
	monthlyPrincipalAndInterest: number;
	monthlyPropertyTax: number; // county + town taxes
	monthlySchoolTax: number;
	totalMonthlyPayment: number;
	annualPropertyTax: number;
	annualSchoolTax: number;
}

/**
 * Calculate the monthly cost breakdown for a house purchase.
 *
 * Uses standard amortization formula:
 *   M = P[r(1+r)^n] / [(1+r)^n - 1]
 * where P = loan amount, r = monthly rate, n = total payments.
 *
 * Tax formula: (assessedValue / 1000) * ratePerThousand
 */
export function calculateMonthlyCost({
	price,
	taxAssessedValue,
	mortgageSettings,
	taxRates
}: {
	price: number;
	taxAssessedValue: number | undefined;
	mortgageSettings: MortgageSettings;
	taxRates: TaxRateEntry | undefined;
}): MonthlyCostBreakdown {
	const downPayment = price * (mortgageSettings.downPaymentPercent / 100);
	const loanAmount = price - downPayment;

	// Calculate monthly principal & interest
	const monthlyRate = mortgageSettings.mortgageRatePercent / 100 / 12;
	const totalPayments = mortgageSettings.loanTermYears * 12;

	let monthlyPrincipalAndInterest: number;

	if (monthlyRate === 0) {
		// No interest — simple division
		monthlyPrincipalAndInterest = loanAmount / totalPayments;
	} else {
		// Standard amortization formula
		const compoundFactor = Math.pow(1 + monthlyRate, totalPayments);
		monthlyPrincipalAndInterest =
			(loanAmount * (monthlyRate * compoundFactor)) / (compoundFactor - 1);
	}

	// Calculate property taxes (county + town) and school taxes
	let annualPropertyTax = 0;
	let annualSchoolTax = 0;

	if (taxAssessedValue !== undefined && taxRates !== undefined) {
		const assessedValuePerThousand = taxAssessedValue / 1000;
		annualPropertyTax =
			assessedValuePerThousand * (taxRates.countyTaxRate + taxRates.townTaxRate);
		annualSchoolTax = assessedValuePerThousand * taxRates.schoolTaxRate;
	}

	const monthlyPropertyTax = annualPropertyTax / 12;
	const monthlySchoolTax = annualSchoolTax / 12;

	const totalMonthlyPayment =
		monthlyPrincipalAndInterest + monthlyPropertyTax + monthlySchoolTax;

	return {
		loanAmount: Math.round(loanAmount),
		downPayment: Math.round(downPayment),
		monthlyPrincipalAndInterest: Math.round(monthlyPrincipalAndInterest * 100) / 100,
		monthlyPropertyTax: Math.round(monthlyPropertyTax * 100) / 100,
		monthlySchoolTax: Math.round(monthlySchoolTax * 100) / 100,
		totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
		annualPropertyTax: Math.round(annualPropertyTax * 100) / 100,
		annualSchoolTax: Math.round(annualSchoolTax * 100) / 100
	};
}
