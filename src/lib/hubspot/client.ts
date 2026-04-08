/**
 * HubSpot API Client
 *
 * Requires env var: HUBSPOT_ACCESS_TOKEN
 * Get one at: Settings > Integrations > Private Apps in HubSpot
 * Scopes needed: crm.objects.deals.read, crm.objects.owners.read
 */

const HUBSPOT_BASE_URL = "https://api.hubapi.com";

function getToken(): string {
  const token = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      "HUBSPOT_ACCESS_TOKEN is not set. Create a HubSpot Private App and add the token to .env.local"
    );
  }
  return token;
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

// ─── Types ────────────────────────────────────────────

export interface HubSpotDeal {
  id: string;
  properties: Record<string, string | null>;
}

export interface HubSpotSearchResponse {
  total: number;
  results: HubSpotDeal[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface HubSpotOwner {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface HubSpotOwnersResponse {
  results: HubSpotOwner[];
  paging?: {
    next?: {
      after: string;
    };
  };
}

export interface SearchFilter {
  propertyName: string;
  operator: string;
  value?: string;
  values?: string[];
}

export interface SearchFilterGroup {
  filters: SearchFilter[];
}

// ─── API Methods ──────────────────────────────────────

/**
 * Search deals using the HubSpot CRM search API.
 * Handles pagination via the `after` cursor.
 */
export async function searchDeals(
  filterGroups: SearchFilterGroup[],
  properties: string[],
  limit: number = 100,
  after?: string
): Promise<HubSpotSearchResponse> {
  const body: Record<string, unknown> = {
    filterGroups,
    properties,
    limit,
    sorts: [{ propertyName: "closedate", direction: "DESCENDING" }],
  };

  if (after) {
    body.after = after;
  }

  const res = await fetch(`${HUBSPOT_BASE_URL}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot searchDeals failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<HubSpotSearchResponse>;
}

/**
 * Fetch all deal owners. Paginates automatically.
 */
export async function getOwners(): Promise<HubSpotOwner[]> {
  const allOwners: HubSpotOwner[] = [];
  let after: string | undefined;

  do {
    const url = new URL(`${HUBSPOT_BASE_URL}/crm/v3/owners/`);
    url.searchParams.set("limit", "100");
    if (after) url.searchParams.set("after", after);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: headers(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HubSpot getOwners failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as HubSpotOwnersResponse;
    allOwners.push(...data.results);
    after = data.paging?.next?.after;
  } while (after);

  return allOwners;
}

/**
 * Fetch all deals matching filters, handling pagination automatically.
 * Returns all results across pages.
 */
export async function searchAllDeals(
  filterGroups: SearchFilterGroup[],
  properties: string[]
): Promise<HubSpotDeal[]> {
  const allDeals: HubSpotDeal[] = [];
  let after: string | undefined;

  do {
    const response = await searchDeals(filterGroups, properties, 100, after);
    allDeals.push(...response.results);
    after = response.paging?.next?.after;
  } while (after);

  return allDeals;
}
