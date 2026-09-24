// W2W edition / variant system — build-time flag + runtime gating.
// Default to "full" so the web preview shows everything.

export type Variant = "individual" | "student" | "company" | "school" | "full";
export type AccountType = "individual" | "student" | "company" | "school";
export type Feature =
  | "scanner"
  | "mylog"
  | "marketplace"
  | "marketplace-list"
  | "facilities"
  | "wallet"
  | "friends"
  | "org-dashboard"
  | "org-school-tools"
  | "org-company-tools";

declare global {
  interface Window {
    w2w?: {
      variant?: Variant;
      platform?: string;
      isElectron?: boolean;
      appVersion?: string;
    };
  }
}

const FEATURE_MAP: Record<Variant, Feature[]> = {
  individual: ["scanner", "mylog", "marketplace", "marketplace-list", "facilities"],
  student: [
    "scanner",
    "mylog",
    "marketplace",
    "marketplace-list",
    "facilities",
    "wallet",
    "friends",
  ],
  company: ["scanner", "mylog", "facilities", "org-dashboard", "org-company-tools"],
  school: [
    "scanner",
    "mylog",
    "facilities",
    "org-dashboard",
    "org-school-tools",
    "friends",
  ],
  full: [
    "scanner",
    "mylog",
    "marketplace",
    "marketplace-list",
    "facilities",
    "wallet",
    "friends",
    "org-dashboard",
    "org-school-tools",
    "org-company-tools",
  ],
};

const ACCOUNT_TO_VARIANT: Record<AccountType, Variant> = {
  individual: "individual",
  student: "student",
  company: "company",
  school: "school",
};

export function getVariant(): Variant {
  // Electron preload wins (matches installer that user downloaded)
  if (typeof window !== "undefined" && window.w2w?.variant) {
    return window.w2w.variant;
  }
  const fromEnv = (import.meta.env.VITE_W2W_VARIANT as Variant | undefined) || "full";
  return fromEnv;
}

export function isElectron(): boolean {
  return typeof window !== "undefined" && !!window.w2w?.isElectron;
}

export function getAllowedFeatures(v: Variant = getVariant()): Feature[] {
  return FEATURE_MAP[v] || FEATURE_MAP.full;
}

export function hasFeature(f: Feature, v: Variant = getVariant()): boolean {
  return getAllowedFeatures(v).includes(f);
}

/**
 * Check if a logged-in profile's account_type is allowed inside this variant build.
 * `full` accepts everyone (web preview). Specific editions only accept matching account_type.
 */
export function accountAllowedInVariant(
  accountType: AccountType | null | undefined,
  v: Variant = getVariant()
): { ok: boolean; expected: Variant | null } {
  if (v === "full") return { ok: true, expected: null };
  if (!accountType) return { ok: true, expected: null }; // not logged in yet
  const required = ACCOUNT_TO_VARIANT[accountType];
  return { ok: required === v, expected: required };
}

export const VARIANT_LABEL: Record<Variant, string> = {
  individual: "Individual",
  student: "Student",
  company: "Company",
  school: "School",
  full: "Full",
};
