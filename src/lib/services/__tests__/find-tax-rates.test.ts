import { describe, it, expect } from "vitest";
import { findTaxRates } from "../find-tax-rates";

describe("findTaxRates", () => {
	it("returns tax rates for a known Monroe County town", () => {
		const result = findTaxRates({ city: "Penfield", state: "NY" });

		expect(result).toBeDefined();
		expect(result?.town).toBe("Penfield");
		expect(result?.county).toBe("Monroe");
		expect(result?.countyTaxRate).toBeGreaterThan(0);
		expect(result?.townTaxRate).toBeGreaterThan(0);
		expect(result?.schoolTaxRate).toBeGreaterThan(0);
	});

	it("is case-insensitive for city", () => {
		const result = findTaxRates({ city: "penfield", state: "NY" });
		expect(result).toBeDefined();
		expect(result?.town).toBe("Penfield");
	});

	it("is case-insensitive for state", () => {
		const result = findTaxRates({ city: "Penfield", state: "ny" });
		expect(result).toBeDefined();
		expect(result?.town).toBe("Penfield");
	});

	it("trims whitespace from inputs", () => {
		const result = findTaxRates({ city: "  Penfield  ", state: "  NY  " });
		expect(result).toBeDefined();
		expect(result?.town).toBe("Penfield");
	});

	it("returns undefined for an unknown city", () => {
		const result = findTaxRates({ city: "UnknownTown", state: "NY" });
		expect(result).toBeUndefined();
	});

	it("returns undefined for wrong state", () => {
		const result = findTaxRates({ city: "Penfield", state: "CA" });
		expect(result).toBeUndefined();
	});

	it("finds Webster tax rates", () => {
		const result = findTaxRates({ city: "Webster", state: "NY" });
		expect(result).toBeDefined();
		expect(result?.town).toBe("Webster");
		expect(result?.schoolDistrict).toBe("Webster");
	});

	it("finds Rochester tax rates", () => {
		const result = findTaxRates({ city: "Rochester", state: "NY" });
		expect(result).toBeDefined();
		expect(result?.town).toBe("Rochester");
	});

	it("finds all expected Monroe County towns", () => {
		const towns = [
			"Penfield",
			"Webster",
			"Pittsford",
			"Greece",
			"Brighton",
			"Henrietta",
			"Perinton",
			"Chili",
			"Gates",
			"Irondequoit",
			"Victor",
			"Fairport",
			"Rochester"
		];

		for (const town of towns) {
			const result = findTaxRates({ city: town, state: "NY" });
			expect(result).toBeDefined();
			expect(result?.town).toBe(town);
		}
	});
});
