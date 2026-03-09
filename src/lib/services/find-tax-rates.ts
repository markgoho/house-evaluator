import { MONROE_COUNTY_TAX_RATES, type TaxRateEntry } from "$lib/config/tax-rates";

/**
 * Find tax rates for a given city and state by matching against
 * known Monroe County, NY municipalities.
 */
export function findTaxRates({
	city,
	state
}: {
	city: string;
	state: string;
}): TaxRateEntry | undefined {
	const normalizedCity = city.toLowerCase().trim();
	const normalizedState = state.toLowerCase().trim();

	return MONROE_COUNTY_TAX_RATES.find(
		(entry) =>
			entry.town.toLowerCase() === normalizedCity &&
			entry.state.toLowerCase() === normalizedState
	);
}
