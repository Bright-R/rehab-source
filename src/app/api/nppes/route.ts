import { NextRequest, NextResponse } from "next/server";
import { searchNPPES } from "@/lib/nppes";
import { Discipline } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const disciplinesParam = searchParams.get("disciplines") || "PT";
  const disciplines = disciplinesParam.split(",").filter(Boolean) as Discipline[];
  const state = searchParams.get("state") || undefined;
  const city = searchParams.get("city") || undefined;
  const zip = searchParams.get("zip") || undefined;
  const limit = Number(searchParams.get("limit") || "200");
  const skip = Number(searchParams.get("skip") || "0");

  if (disciplines.length === 0) {
    return NextResponse.json({ error: "At least one discipline required" }, { status: 400 });
  }

  try {
    const results = await searchNPPES({
      disciplines,
      state,
      city,
      postalCode: zip,
      limit,
      skip,
    });

    return NextResponse.json({ count: results.length, results });
  } catch (error) {
    console.error("NPPES API error:", error);
    return NextResponse.json({ error: "Failed to fetch from NPPES" }, { status: 500 });
  }
}