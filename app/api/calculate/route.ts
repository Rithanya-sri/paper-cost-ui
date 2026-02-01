import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const paperUsed = Number(body.paperUsed);
  const pricePerKg = 40;

  const paperCost = paperUsed * pricePerKg;

  return NextResponse.json({
    paperCost: paperCost,
  });
}
