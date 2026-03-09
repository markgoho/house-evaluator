/**
 * Monroe County, NY tax rates per $1,000 of assessed value.
 * Sources: Monroe County, town, and school district tax rolls.
 * These rates should be updated annually when new rates are published.
 */

export interface TaxRateEntry {
	town: string;
	county: string;
	state: string;
	countyTaxRate: number; // per $1,000 assessed value
	townTaxRate: number; // per $1,000 assessed value
	schoolTaxRate: number; // per $1,000 assessed value
	schoolDistrict: string;
}

/**
 * Tax rates for Monroe County, NY municipalities.
 * Rates are approximate and based on publicly available data.
 * County rate is shared across all towns (~9.54/1000 for 2024-2025).
 */
export const MONROE_COUNTY_TAX_RATES: readonly TaxRateEntry[] = [
	{
		town: "Penfield",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 2.85,
		schoolTaxRate: 22.5,
		schoolDistrict: "Penfield"
	},
	{
		town: "Webster",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 3.1,
		schoolTaxRate: 21.8,
		schoolDistrict: "Webster"
	},
	{
		town: "Pittsford",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 2.2,
		schoolTaxRate: 24.0,
		schoolDistrict: "Pittsford"
	},
	{
		town: "Greece",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 5.9,
		schoolTaxRate: 20.5,
		schoolDistrict: "Greece"
	},
	{
		town: "Brighton",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 5.0,
		schoolTaxRate: 23.5,
		schoolDistrict: "Brighton"
	},
	{
		town: "Henrietta",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 4.5,
		schoolTaxRate: 22.0,
		schoolDistrict: "Rush-Henrietta"
	},
	{
		town: "Perinton",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 2.75,
		schoolTaxRate: 22.5,
		schoolDistrict: "Fairport"
	},
	{
		town: "Chili",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 5.2,
		schoolTaxRate: 22.0,
		schoolDistrict: "Churchville-Chili"
	},
	{
		town: "Gates",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 5.8,
		schoolTaxRate: 21.0,
		schoolDistrict: "Gates Chili"
	},
	{
		town: "Irondequoit",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 6.5,
		schoolTaxRate: 22.0,
		schoolDistrict: "East Irondequoit"
	},
	{
		town: "Victor",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 2.5,
		schoolTaxRate: 20.0,
		schoolDistrict: "Victor"
	},
	{
		town: "Fairport",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 2.75,
		schoolTaxRate: 22.5,
		schoolDistrict: "Fairport"
	},
	{
		town: "Rochester",
		county: "Monroe",
		state: "NY",
		countyTaxRate: 9.54,
		townTaxRate: 13.5,
		schoolTaxRate: 27.0,
		schoolDistrict: "Rochester City"
	}
] as const;
