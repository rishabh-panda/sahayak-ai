import { Router } from "express";
import { db, healthRecordsTable } from "@workspace/db";
import { eq, desc, gte } from "drizzle-orm";
import { CreateHealthRecordBody, ListHealthRecordsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/health-records", async (req, res): Promise<void> => {
  const queryParsed = ListHealthRecordsQueryParams.safeParse(req.query);
  const type = queryParsed.success ? queryParsed.data.type : undefined;
  const limit = queryParsed.success ? (queryParsed.data.limit ?? 20) : 20;

  let query = db.select().from(healthRecordsTable).$dynamic();
  if (type) {
    query = query.where(eq(healthRecordsTable.type, type));
  }
  const records = await query.orderBy(desc(healthRecordsTable.recordedAt)).limit(limit);
  res.json(records);
});

router.get("/health-records/summary", async (req, res): Promise<void> => {
  const types = ["blood_pressure", "blood_sugar", "weight", "heart_rate"] as const;
  const summary: Record<string, unknown> = {};

  for (const type of types) {
    const [latest] = await db
      .select()
      .from(healthRecordsTable)
      .where(eq(healthRecordsTable.type, type))
      .orderBy(desc(healthRecordsTable.recordedAt))
      .limit(1);
    const key = `latest${type.split("_").map(w => w[0].toUpperCase() + w.slice(1)).join("")}`;
    summary[key] = latest ?? null;
  }

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyRecords = await db
    .select()
    .from(healthRecordsTable)
    .where(gte(healthRecordsTable.recordedAt, oneWeekAgo));

  summary.weeklyRecordCount = weeklyRecords.length;
  res.json(summary);
});

router.post("/health-records", async (req, res): Promise<void> => {
  const parsed = CreateHealthRecordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [record] = await db
    .insert(healthRecordsTable)
    .values({
      ...parsed.data,
      recordedAt: parsed.data.recordedAt ?? new Date(),
    })
    .returning();
  res.status(201).json(record);
});

export default router;
