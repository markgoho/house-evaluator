import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

const ALLOWED_DOMAINS = [
	"zillow.com",
	"zillowstatic.com",
	"redfin.com",
	"rdc.moveaws.com", // Realtor.com CDN
	"realtor.com"
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/download-image
 *
 * Downloads an image from a trusted real estate listing domain
 * This acts as a CORS proxy to bypass browser CORS restrictions
 *
 * Security:
 * - Only allows downloading from whitelisted domains
 * - Validates content type is an image
 * - Enforces 5MB size limit
 *
 * Request body: { imageUrl: string }
 * Response: { image: string (base64), contentType: string }
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { imageUrl } = await request.json();

		if (!imageUrl || typeof imageUrl !== "string") {
			return json({ error: "Missing or invalid imageUrl" }, { status: 400 });
		}

		// Validate URL format
		let url: URL;
		try {
			url = new URL(imageUrl);
		} catch {
			return json({ error: "Invalid URL format" }, { status: 400 });
		}

		// Check if domain is allowed (including subdomains)
		const hostname = url.hostname.toLowerCase();
		const isAllowed = ALLOWED_DOMAINS.some(
			(domain) => hostname === domain || hostname.endsWith(`.${domain}`)
		);

		if (!isAllowed) {
			return json(
				{ error: `Domain not allowed. Only real estate listing sites are supported.` },
				{ status: 403 }
			);
		}

		// Fetch the image
		const response = await fetch(imageUrl, {
			headers: {
				// Mimic a browser to avoid being blocked
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
			}
		});

		if (!response.ok) {
			return json(
				{ error: `Failed to fetch image: ${response.status} ${response.statusText}` },
				{ status: response.status }
			);
		}

		// Validate content type
		const contentType = response.headers.get("content-type") || "";
		if (!contentType.startsWith("image/")) {
			return json({ error: `URL does not point to an image (got ${contentType})` }, { status: 400 });
		}

		// Get image data as ArrayBuffer
		const arrayBuffer = await response.arrayBuffer();

		// Validate size
		if (arrayBuffer.byteLength > MAX_IMAGE_SIZE) {
			return json(
				{ error: `Image too large (${Math.round(arrayBuffer.byteLength / 1024 / 1024)}MB). Maximum is 5MB.` },
				{ status: 413 }
			);
		}

		// Convert to base64
		const buffer = Buffer.from(arrayBuffer);
		const base64 = buffer.toString("base64");

		return json({
			image: base64,
			contentType,
			size: arrayBuffer.byteLength
		});
	} catch (error) {
		console.error("Error downloading image:", error);
		return json(
			{ error: error instanceof Error ? error.message : "Internal server error" },
			{ status: 500 }
		);
	}
};
