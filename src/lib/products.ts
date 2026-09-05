/**
 * Dodo Payments Product Configuration
 * Maps pricing tiers and billing cycles to Dodo Payments product IDs.
 * Dynamically switches between test_mode and live_mode based on DODO_PAYMENTS_ENVIRONMENT.
 */

const isLive =
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ||
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live' ||
  process.env.NEXT_PUBLIC_DODO_MODE === 'live';

export const DODO_PRODUCTS_TEST = {
  STARTER: {
    monthly: process.env.DODO_PRODUCT_STARTER_MONTHLY || 'pdt_test_starter_monthly',
    annual: process.env.DODO_PRODUCT_STARTER_ANNUAL || 'pdt_test_starter_annual',
  },
  PRO: {
    monthly: process.env.DODO_PRODUCT_PRO_MONTHLY || 'pdt_test_pro_monthly',
    annual: process.env.DODO_PRODUCT_PRO_ANNUAL || 'pdt_test_pro_annual',
  },
  AGENCY: {
    monthly: process.env.DODO_PRODUCT_AGENCY_MONTHLY || 'pdt_test_agency_monthly',
    annual: process.env.DODO_PRODUCT_AGENCY_ANNUAL || 'pdt_test_agency_annual',
  },
  DFY_SETUP: {
    oneTime: process.env.DODO_PRODUCT_DFY_SETUP || 'pdt_test_dfy_setup',
  },
} as const;

export const DODO_PRODUCTS_LIVE = {
  STARTER: {
    monthly: process.env.DODO_PRODUCT_STARTER_MONTHLY || 'pdt_live_starter_monthly',
    annual: process.env.DODO_PRODUCT_STARTER_ANNUAL || 'pdt_live_starter_annual',
  },
  PRO: {
    monthly: process.env.DODO_PRODUCT_PRO_MONTHLY || 'pdt_live_pro_monthly',
    annual: process.env.DODO_PRODUCT_PRO_ANNUAL || 'pdt_live_pro_annual',
  },
  AGENCY: {
    monthly: process.env.DODO_PRODUCT_AGENCY_MONTHLY || 'pdt_live_agency_monthly',
    annual: process.env.DODO_PRODUCT_AGENCY_ANNUAL || 'pdt_live_agency_annual',
  },
  DFY_SETUP: {
    oneTime: process.env.DODO_PRODUCT_DFY_SETUP || 'pdt_live_dfy_setup',
  },
} as const;

export const DODO_PRODUCTS = isLive ? DODO_PRODUCTS_LIVE : DODO_PRODUCTS_TEST;

export type DodoTier = keyof typeof DODO_PRODUCTS_LIVE;
export const IS_DODO_LIVE = isLive;
