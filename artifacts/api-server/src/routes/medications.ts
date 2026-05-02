import { Router } from "express";
import { db, medicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateMedicationBody, UpdateMedicationBody, UpdateMedicationParams } from "@workspace/api-zod";

const router = Router();

router.get("/medications", async (req, res): Promise<void> => {
  const meds = await db.select().from(medicationsTable).orderBy(medicationsTable.name);
  res.json(meds);
});

router.post("/medications", async (req, res): Promise<void> => {
  const parsed = CreateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [med] = await db
    .insert(medicationsTable)
    .values({
      ...parsed.data,
      times: parsed.data.times as string[],
      startDate: parsed.data.startDate ? parsed.data.startDate.toISOString().split("T")[0] : null,
      endDate: parsed.data.endDate ? parsed.data.endDate.toISOString().split("T")[0] : null,
      isActive: true,
    })
    .returning();
  res.status(201).json(med);
});

router.put("/medications/:id", async (req, res): Promise<void> => {
  const params = UpdateMedicationParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateMedicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.times) updateData.times = parsed.data.times as string[];
  if (parsed.data.endDate) updateData.endDate = (parsed.data.endDate as Date).toISOString().split("T")[0];
  const [updated] = await db
    .update(medicationsTable)
    .set(updateData)
    .where(eq(medicationsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Medication not found" });
    return;
  }
  res.json(updated);
});

router.delete("/medications/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(medicationsTable).where(eq(medicationsTable.id, id));
  res.status(204).end();
});

export default router;
