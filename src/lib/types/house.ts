export interface House {
  id: string;
  familyId: string;
  // Address information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  // Property details
  squareFeet: number | null;
  lotSize: number | null; // in square feet
  bedrooms: number | null;
  bathrooms: number | null;
  yearBuilt: number | null;
  price: number | null;
  pricePerSqFt: number | null; // auto-calculated
  // Additional info
  listingUrl: string | null;
  photoUrls: string[];
  notes: string | null;
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HouseInput = Omit<
  House,
  "id" | "pricePerSqFt" | "createdAt" | "updatedAt"
>;
export type HouseUpdate = Partial<HouseInput>;
