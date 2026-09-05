/**
 * Dodo Payments Product Configuration
 * Maps pricing tiers and billing cycles to Dodo Payments product IDs.
 */
export const DODO_PRODUCTS = {
  STARTER: {
    monthly: 'pdt_starter_monthly_id',
    annual: 'pdt_starter_annual_id',
  },
  PRO: {
    monthly: 'pdt_pro_monthly_id',
    annual: 'pdt_pro_annual_id',
  },
  AGENCY: {
    monthly: 'pdt_agency_monthly_id',
    annual: 'pdt_agency_annual_id',
  },
  DFY_SETUP: {
    oneTime: 'pdt_dfy_setup_id',
  },
} as const;

export type DodoTier = keyof typeof DODO_PRODUCTS;
