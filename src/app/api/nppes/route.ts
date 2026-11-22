import { NextRequest, NextResponse } from "next/server";
import { searchNPPES } from "@/lib/nppes";
import { Discipline } from "@/types";

function distanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getZipCoords(zip: string): Promise<{ lat: number; lon: number; state?: string } | null> {
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
    if (!res.ok) return null;
    const data = await res.json();
    const place = data.places?.[0];
    if (!place) return null;
    return {
      lat: parseFloat(place.latitude),
      lon: parseFloat(place.longitude),
      state: place["state abbreviation"],
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const disciplinesParam = searchParams.get("disciplines") || "PT";
  const disciplines = disciplinesParam.split(",").filter(Boolean) as Discipline[];
  const state = searchParams.get("state") || undefined;
  const city = searchParams.get("city") || undefined;
  const zip = searchParams.get("zip") || undefined;
  const radiusMiles = Number(searchParams.get("radius") || "0");
  const limit = Number(searchParams.get("limit") || "200");
  const skip = Number(searchParams.get("skip") || "0");

  if (disciplines.length === 0) {
    return NextResponse.json({ error: "At least one discipline required" }, { status: 400 });
  }

  let searchState = state;
  let searchCity = city;
  let searchZip = zip;
  let origin: { lat: number; lon: number } | null = null;

  if (zip && radiusMiles > 0) {
    const coords = await getZipCoords(zip);
    if (coords) {
      origin = { lat: coords.lat, lon: coords.lon };
      // Search the whole state so we have a bigger pool to filter
      searchState = coords.state || state;
      searchCity = undefined;
      searchZip = undefined;
    }
  }

  try {
    let results = await searchNPPES({
      disciplines,
      state: searchState,
      city: searchCity,
      postalCode: searchZip,
      limit: radiusMiles > 0 ? 200 : limit,
      skip,
    });

    if (origin && radiusMiles > 0) {
      const filtered = [];
      for (const r of results) {
        if (!r.zip) continue;
        const c = await getZipCoords(r.zip);
        if (!c) continue;
        const dist = distanceMiles(origin.lat, origin.lon, c.lat, c.lon);
        if (dist <= radiusMiles) {
          filtered.push({ ...r, distance: Math.round(dist * 10) / 10 });
        }
      }
      results = filtered;
    }

    return NextResponse.json({ count: results.length, results });
  } catch (error) {
    console.error("NPPES API error:", error);
    return NextResponse.json({ error: "Failed to fetch from NPPES" }, { status: 500 });
  }
}