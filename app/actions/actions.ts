"use server";

import {
  HubSpotContactResult,
  HubSpotFieldsResult,
  HubSpotContact,
} from "@/types/hubspot";

const baseUrl = process.env.HUBSPOT_API_BASE;
const token = process.env.HUBSPOT_ACCESS_TOKEN;

export const fetchContactProperties = async () => {
  if (!baseUrl || !token) {
    return {
      success: false,
      error: "Missing HUBSPOT_API_BASE or HUBSPOT_ACCESS_TOKEN",
    };
  }

  try {
    const res = await fetch(`${baseUrl}/properties/v1/contacts/properties`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: `Error ${res.status}: ${text}` };
    }

    const data = await res.json();

    const fieldNames = data.map((prop: any) => prop.name);

    return {
      success: true,
      fields: data,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
};

export async function fetchHubSpotContacts(): Promise<HubSpotContactResult> {
  if (!baseUrl || !token) {
    return {
      success: false,
      error: "Missing HUBSPOT_API_BASE or HUBSPOT_ACCESS_TOKEN",
    };
  }

  const props = [
    "firstname",
    "lastname",
    "email",
    "company",
    "city",
    "state",
    "zip",
    "address",
    "phone", // <-- added!
  ];

  const fullUrl = `${baseUrl}/crm/v3/objects/contacts?limit=100&properties=${props.join(
    ","
  )}`;

  try {
    const res = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return {
        success: false,
        error: `HubSpot error: ${res.status} - ${text}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      contacts: data.results,
    };
  } catch (err) {
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}

export async function fetchAllContactFields(): Promise<HubSpotFieldsResult> {
  if (!baseUrl || !token) {
    return {
      success: false,
      error: "Missing HUBSPOT_API_BASE or HUBSPOT_ACCESS_TOKEN",
    };
  }

  const fullUrl = `${baseUrl}/crm/v3/properties/contacts`;

  try {
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Error fetching contact fields: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      fields: data.results,
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message,
    };
  }
}

export async function searchContactsByCompany(
  company: string,
  after = "",
  limit = 50,
  email?: string
): Promise<{ results: HubSpotContact[]; paging: string | null }> {
  return searchContacts("company", company, after, limit, email);
}

export async function searchContactsByPostalCode(
  postalCode: string,
  after = "",
  limit = 50
): Promise<{ results: HubSpotContact[]; paging: string | null }> {
  return searchContacts("zip", postalCode, after, limit);
}

export async function searchContactsByCity(
  city: string,
  after = "",
  limit = 50
): Promise<{ results: HubSpotContact[]; paging: string | null }> {
  return searchContacts("city", city, after, limit);
}

async function searchContacts(
  property: string,
  value: string,
  after = "",
  limit = 50,
  email?: string
): Promise<{ results: HubSpotContact[]; paging: string | null }> {
  const baseUrl = process.env.HUBSPOT_API_BASE;
  const token = process.env.HUBSPOT_ACCESS_TOKEN;

  const filters = [
    {
      propertyName: property,
      operator: property === "company" ? "CONTAINS_TOKEN" : "EQ",
      value: value.toLowerCase().trim(), // normalize input
    },
  ];

  if (email) {
    filters.push({
      propertyName: "ba_email",
      operator: "EQ",
      value: email,
    });
  }

  const response = await fetch(`${baseUrl}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters,
        },
      ],
      properties: [
        "firstname",
        "lastname",
        "email",
        "company",
        "phone",
        "address",
        "city",
        "state",
        "zip",
        "hs_lead_status",
        "l2_lead_status",
        "ba_email",
      ],
      sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
      limit,
      after: after || undefined,
    }),
  });

  const data = await response.json();

  return {
    results: data.results ?? [],
    paging: data.paging?.next?.after ?? null,
  };
}

// app/actions/actions.ts or wherever this is defined
export async function fetchHubSpotContactsPaginated(
  limit = 12,
  after = "",
  baEmail?: string
) {
  const props = [
    "firstname",
    "lastname",
    "email",
    "company",
    "phone",
    "address",
    "city",
    "state",
    "zip",
    "hs_lead_status",
    "l2_lead_status",
    "ba_email",
  ];

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const filters = baEmail
    ? [
        {
          propertyName: "ba_email",
          operator: "EQ",
          value: baEmail,
        },
      ]
    : [];

  const body = {
    filterGroups: filters.length ? [{ filters }] : [],
    sorts: [{ propertyName: "createdate", direction: "DESCENDING" }],
    properties: props,
    limit,
    after: after || undefined,
  };

  const res = await fetch(`${baseUrl}/crm/v3/objects/contacts/search`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HubSpot search error: ${res.status} - ${text}`);
  }

  const data = await res.json();

  return {
    results: data.results,
    next: data.paging?.next?.after ?? null,
  };
}

// actions/actions.ts
export async function fetchHubSpotContactsTotalCount(): Promise<number> {
  const url = `${baseUrl}/crm/v3/objects/contacts?limit=1`; // Only need one item

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch total count");
  }

  const data = await response.json();

  // HubSpot doesn't give a true total, but we can *approximate* using paging
  // If your account has a Pro+ plan you may use `/search` with a blank filter + count

  // OPTION 1: use paging.next.after + count fetched so far
  // OPTION 2: if you really want a reliable total, use /search instead:
  // `/crm/v3/objects/contacts/search` with filterGroups: [] and get `total` from response

  return data.total ?? 0;
}

///////////////////////////// new search
