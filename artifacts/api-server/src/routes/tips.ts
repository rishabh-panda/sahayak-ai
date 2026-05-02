import { Router } from "express";
import { db, tipsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetDailyTipsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/tips/daily", async (req, res): Promise<void> => {
  const queryParsed = GetDailyTipsQueryParams.safeParse(req.query);
  const language = queryParsed.success ? (queryParsed.data.language ?? "en") : "en";

  let tips = await db.select().from(tipsTable).where(eq(tipsTable.language, language)).limit(5);

  if (tips.length === 0) {
    tips = await db.select().from(tipsTable).where(eq(tipsTable.language, "en")).limit(5);
  }

  res.json(tips);
});

export default router;
