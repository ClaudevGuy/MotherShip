import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  withErrorHandler,
  requireAuth,
  getProjectId,
  apiResponse,
} from "@/lib/api-helpers";

// ── GET /api/costs/daily ──
//
// Returns a DENSE daily-cost series for the requested window. Every calendar
// day in [today - days + 1, today] gets exactly one entry; days with no
// activity get 0. This prevents stale data from visually "drifting" into
// today on charts that plot a sparse series as if it were consecutive.
//
// Query params:
//   days=<7|14|30|90|...>   (default 30, max 365)
//
// Returns: { costs: [{ date: "YYYY-MM-DD", value: number }, ...] }

const DAY_MS = 86_400_000;

function toDateKey(d: Date): string {
  // YYYY-MM-DD in UTC — stable, timezone-independent
  return d.toISOString().slice(0, 10);
}

function startOfUTCDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export const GET = withErrorHandler(async (request: NextRequest) => {
  await requireAuth();
  const projectId = await getProjectId();
  const { searchParams } = request.nextUrl;

  const rawDays = parseInt(searchParams.get("days") ?? "30", 10);
  const days = Math.min(Math.max(Number.isFinite(rawDays) ? rawDays : 30, 1), 365);

  const now = new Date();
  const todayUTC = startOfUTCDay(now);
  const startUTC = new Date(todayUTC.getTime() - (days - 1) * DAY_MS);

  // Aggregate spend per UTC day from LlmCall (source of truth for real spend)
  const llmCalls = await prisma.llmCall.findMany({
    where: {
      projectId,
      timestamp: { gte: startUTC },
    },
    select: { timestamp: true, cost: true },
  });

  const byDate = new Map<string, number>();
  for (const call of llmCalls) {
    const key = toDateKey(call.timestamp);
    byDate.set(key, (byDate.get(key) ?? 0) + call.cost);
  }

  // Build dense series — exactly one entry per day in the window
  const costs: { date: string; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startUTC.getTime() + i * DAY_MS);
    const key = toDateKey(d);
    costs.push({
      date: key,
      value: Math.round((byDate.get(key) ?? 0) * 10000) / 10000,
    });
  }

  return apiResponse({ costs, days });
});
