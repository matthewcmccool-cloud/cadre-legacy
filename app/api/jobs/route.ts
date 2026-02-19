import { NextRequest, NextResponse } from "next/server";
import { fetchFilteredJobs } from "@/lib/airtable";
import type { JobFilters } from "@/lib/airtable";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const filters: JobFilters = {};

  const search = searchParams.get("search");
  if (search) filters.search = search;

  const functions = searchParams.get("functions");
  if (functions) filters.functions = functions.split(",").filter(Boolean);

  const industry = searchParams.get("industry");
  if (industry) filters.industries = industry.split(",").filter(Boolean);

  const locations = searchParams.get("locations");
  if (locations) filters.locations = locations.split(",").filter(Boolean);

  const remote = searchParams.get("remote");
  if (remote === "remote" || remote === "onsite") {
    filters.remote = remote;
  }

  try {
    const { jobs, total } = await fetchFilteredJobs(filters);
    return NextResponse.json({ jobs, total });
  } catch (err) {
    console.error("API /api/jobs error:", err);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
