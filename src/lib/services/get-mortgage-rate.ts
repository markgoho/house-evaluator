const FALLBACK_RATE = 6.5;

/**
 * Fetch the current 30-year fixed mortgage rate from the Cloud Function proxy.
 * Falls back to a hard-coded rate if the call fails.
 */
export async function getMortgageRate(): Promise<number> {
	try {
		const response = await fetch("/api/mortgage-rate");

		if (!response.ok) {
			console.warn(`[Mortgage Rate] API returned ${response.status}: ${response.statusText}`);
			return FALLBACK_RATE;
		}

		const data = (await response.json()) as { rate?: number; source?: string };

		if (data.rate === undefined || Number.isNaN(data.rate) || data.rate <= 0) {
			return FALLBACK_RATE;
		}

		return data.rate;
	} catch (error) {
		console.warn("[Mortgage Rate] Error fetching rate:", error);
		return FALLBACK_RATE;
	}
}
