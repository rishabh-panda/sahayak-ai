import { Router } from "express";
import { db, checkinsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateCheckinBody } from "@workspace/api-zod";

const router = Router();

router.post("/checkin", async (req, res): Promise<void> => {
  const parsed = CreateCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const today = new Date().toISOString().split("T")[0];
  const [checkin] = await db
    .insert(checkinsTable)
    .values({ ...parsed.data, date: today })
    .returning();
  res.status(201).json(checkin);
});

router.get("/checkin/history", async (req, res): Promise<void> => {
  const history = await db
    .select()
    .from(checkinsTable)
    .orderBy(desc(checkinsTable.date))
    .limit(30);
  res.json(history);
});

export default router;
