export interface MortgageSettings {
  downPaymentPercent: number; // e.g. 20
  mortgageRatePercent: number; // e.g. 6.5
  loanTermYears: number; // e.g. 30
}

export interface Family {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  mortgageSettings?: MortgageSettings;
  createdAt: Date;
  updatedAt: Date;
}

export type FamilyInput = Omit<Family, "id" | "createdAt" | "updatedAt">;
