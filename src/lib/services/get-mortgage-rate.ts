const FRED_API_BASE = "https://api.stlouisfed.org/fred/series/observations";
const MORTGAGE_SERIES_ID = "MORTGAGE30US";
const FALLBACK_RATE = 6.5;

/**
 * Fetch the current 30-year fixed mortgage rate from the FRED API.
 * Falls back to a hard-coded rate if the API call fails.
 */
export async function getMortgageRate(): Promise<number> {
	const apiKey = import.meta.env.VITE_FRED_API_KEY as string | undefined;

	if (apiKey === undefined || apiKey === "") {
		return FALLBACK_RATE;
	}

	try {
		const url = new URL(FRED_API_BASE);
		url.searchParams.set("series_id", MORTGAGE_SERIES_ID);
		url.searchParams.set("api_key", apiKey);
		url.searchParams.set("file_type", "json");
		url.searchParams.set("sort_order", "desc");
		url.searchParams.set("limit", "1");

		const response = await fetch(url.toString());

		if (!response.ok) {
			console.warn(`[FRED API] Failed to fetch mortgage rate: ${response.statusText}`);
			return FALLBACK_RATE;
		}

		const data = (await response.json()) as {
			observations?: Array<{ value?: string }>;
		};

		const latestObservation = data.observations?.at(0);
		if (latestObservation === undefined) {
			return FALLBACK_RATE;
		}

		const rate = Number.parseFloat(latestObservation.value ?? "");
		if (Number.isNaN(rate) || rate <= 0) {
			return FALLBACK_RATE;
		}

		return rate;
	} catch (error) {
		console.warn("[FRED API] Error fetching mortgage rate:", error);
		return FALLBACK_RATE;
	}
}
