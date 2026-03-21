import { ZIP_CODE_TO_TOWN } from "$lib/config/zip-code-to-town";
import { MONROE_COUNTY_TAX_RATES, type TaxRateEntry } from "$lib/config/tax-rates";

/**
 * Find tax rates for a given zip code by mapping it to the primary town.
 */
export function findTaxRatesByZipCode({
	zipCode
}: {
	zipCode: string;
}): TaxRateEntry | undefined {
	const normalizedZipCode = zipCode.trim();
	const town = ZIP_CODE_TO_TOWN[normalizedZipCode];

	if (town === undefined) {
		return undefined;
	}

	return MONROE_COUNTY_TAX_RATES.find((entry) => entry.town === town);
}
