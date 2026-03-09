import {defineSecret} from "firebase-functions/params";
import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";

const FRED_API_BASE = "https://api.stlouisfed.org/fred/series/observations";
const MORTGAGE_SERIES_ID = "MORTGAGE30US";
const FALLBACK_RATE = 6.5;
const SIX_HOURS_SECONDS = 6 * 60 * 60;
const ONE_HOUR_SECONDS = 60 * 60;

const fredApiKey = defineSecret("FRED_API_KEY");

setGlobalOptions({maxInstances: 10});

export const mortgagerate = onRequest(
  {region: "us-east1", cors: true, invoker: "public", secrets: [fredApiKey]},
  async (request, response) => {
    try {
      const url = new URL(FRED_API_BASE);
      url.searchParams.set("series_id", MORTGAGE_SERIES_ID);
      url.searchParams.set("api_key", fredApiKey.value());
      url.searchParams.set("file_type", "json");
      url.searchParams.set("sort_order", "desc");
      url.searchParams.set("limit", "1");

      const fredResponse = await fetch(url.toString());

      if (!fredResponse.ok) {
        logger.warn(
          `FRED API returned ${fredResponse.status}: ${fredResponse.statusText}`
        );
        response.set(
          "Cache-Control",
          `public, max-age=${ONE_HOUR_SECONDS}`
        );
        response.json({rate: FALLBACK_RATE, source: "fallback"});
        return;
      }

      const data = (await fredResponse.json()) as {
        observations?: Array<{value?: string}>;
      };

      const latestValue = data.observations?.[0]?.value;
      if (latestValue === undefined) {
        logger.warn("FRED API returned no observations");
        response.set(
          "Cache-Control",
          `public, max-age=${ONE_HOUR_SECONDS}`
        );
        response.json({rate: FALLBACK_RATE, source: "fallback"});
        return;
      }

      const rate = Number.parseFloat(latestValue);
      if (Number.isNaN(rate) || rate <= 0) {
        logger.warn(`FRED API returned invalid rate: ${latestValue}`);
        response.set(
          "Cache-Control",
          `public, max-age=${ONE_HOUR_SECONDS}`
        );
        response.json({rate: FALLBACK_RATE, source: "fallback"});
        return;
      }

      logger.info(`Fetched mortgage rate: ${rate}%`);
      response.set(
        "Cache-Control",
        `public, max-age=${SIX_HOURS_SECONDS}`
      );
      response.json({rate, source: "fred"});
    } catch (error) {
      logger.error("Error fetching mortgage rate:", error);
      response.set(
        "Cache-Control",
        `public, max-age=${ONE_HOUR_SECONDS}`
      );
      response.json({rate: FALLBACK_RATE, source: "fallback"});
    }
  }
);
