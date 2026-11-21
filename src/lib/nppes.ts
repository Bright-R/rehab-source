import { Discipline, NPPESResult } from "@/types";

const NPPES_BASE = "https://npiregistry.cms.hhs.gov/api/";

const DISCIPLINE_SEARCH_TERMS: Record<Discipline, string> = {
  PT: "Physical Therapist",
  OT: "Occupational Therapist",
  SLP: "Speech-Language Pathologist",
  PTA: "Physical Therapy Assistant",
  OTA: "Occupational Therapy Assistant",
};

interface NPPESResponse {
  result_count: number;
  results: Array<{
    number: string;
    basic: {
      first_name?: string;
      last_name?: string;
      credential?: string;
    };
    taxonomies?: Array<{
      code: string;
      desc: string;
      primary: boolean;
    }>;
    addresses?: Array<{
      address_purpose: string;
      city?: string;
      state?: string;
      postal_code?: string;
      telephone_number?: string;
      address_1?: string;
    }>;
  }>;
}

export async function searchNPPES(params: {
  disciplines: Discipline[];
  state?: string;
  city?: string;
  postalCode?: string;
  limit?: number;
  skip?: number;
}): Promise<NPPESResult[]> {
  const { disciplines, state, city, postalCode, limit = 200, skip = 0 } = params;

  const results: NPPESResult[] = [];
  const seen = new Set<string>();

  for (const discipline of disciplines) {
    const searchTerm = DISCIPLINE_SEARCH_TERMS[discipline];

    const query = new URLSearchParams({
      version: "2.1",
      enumeration_type: "NPI-1",
      taxonomy_description: searchTerm,
      limit: String(Math.min(limit, 200)),
      skip: String(skip),
      pretty: "on",
    });

    if (state) query.set("state", state);
    if (city) query.set("city", city);
    if (postalCode) query.set("postal_code", postalCode);

    try {
      const res = await fetch(`${NPPES_BASE}?${query.toString()}`);
      if (!res.ok) continue;

      const data: NPPESResponse = await res.json();

      for (const item of data.results || []) {
        if (seen.has(item.number)) continue;
        seen.add(item.number);

        const practiceAddress =
          item.addresses?.find((a) => a.address_purpose === "LOCATION") ||
          item.addresses?.[0];

        const primaryTax =
          item.taxonomies?.find((t) => t.primary) || item.taxonomies?.[0];

        results.push({
          npi: item.number,
          firstName: item.basic.first_name || "",
          lastName: item.basic.last_name || "",
          credentials: item.basic.credential,
          taxonomy: primaryTax?.code || "",
          taxonomyDesc: primaryTax?.desc || searchTerm,
          city: practiceAddress?.city,
          state: practiceAddress?.state,
          zip: practiceAddress?.postal_code?.slice(0, 5),
          phone: practiceAddress?.telephone_number,
          address: practiceAddress?.address_1,
        });
      }
    } catch (err) {
      console.error("NPPES fetch error for", discipline, err);
    }
  }

  return results;
}