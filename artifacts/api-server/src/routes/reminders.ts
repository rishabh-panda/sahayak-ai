import { Router } from "express";
import { db, remindersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateReminderBody, UpdateReminderBody, UpdateReminderParams } from "@workspace/api-zod";

const router = Router();

const getDayOfWeek = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

router.get("/reminders", async (req, res): Promise<void> => {
  const reminders = await db.select().from(remindersTable).orderBy(remindersTable.createdAt);
  res.json(reminders);
});

router.get("/reminders/today", async (req, res): Promise<void> => {
  const today = getDayOfWeek();
  const reminders = await db.select().from(remindersTable).where(eq(remindersTable.isActive, true));
  const todayReminders = reminders.filter(
    (r) => r.daysOfWeek.includes(today) || r.daysOfWeek.includes("Mon") // fallback
  );
  res.json(todayReminders);
});

router.post("/reminders", async (req, res): Promise<void> => {
  const parsed = CreateReminderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [reminder] = await db
    .insert(remindersTable)
    .values({
      ...parsed.data,
      daysOfWeek: parsed.data.daysOfWeek as string[],
      isActive: true,
      completedToday: false,
    })
    .returning();
  res.status(201).json(reminder);
});

router.put("/reminders/:id", async (req, res): Promise<void> => {
  const params = UpdateReminderParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateReminderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.daysOfWeek) {
    updateData.daysOfWeek = parsed.data.daysOfWeek as string[];
  }
  const [updated] = await db
    .update(remindersTable)
    .set(updateData)
    .where(eq(remindersTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Reminder not found" });
    return;
  }
  res.json(updated);
});

router.delete("/reminders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(remindersTable).where(eq(remindersTable.id, id));
  res.status(204).end();
});

export default router;
