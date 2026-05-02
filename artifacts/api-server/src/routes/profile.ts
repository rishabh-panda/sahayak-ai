import { Router } from "express";
import { db, profileTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateProfileBody } from "@workspace/api-zod";

const router = Router();

router.get("/profile", async (req, res): Promise<void> => {
  const profiles = await db.select().from(profileTable).limit(1);
  if (profiles.length === 0) {
    const [created] = await db
      .insert(profileTable)
      .values({
        name: "Namaste Friend",
        age: 65,
        language: "en",
        fontSize: "large",
        theme: "light",
      })
      .returning();
    res.json(created);
    return;
  }
  res.json(profiles[0]);
});

router.put("/profile", async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const profiles = await db.select().from(profileTable).limit(1);
  if (profiles.length === 0) {
    const [created] = await db
      .insert(profileTable)
      .values({
        name: parsed.data.name ?? "Friend",
        age: parsed.data.age ?? 65,
        city: parsed.data.city ?? null,
        language: parsed.data.language ?? "en",
        emergencyPhone: parsed.data.emergencyPhone ?? null,
        avatar: parsed.data.avatar ?? null,
        fontSize: parsed.data.fontSize ?? "large",
        theme: parsed.data.theme ?? "light",
      })
      .returning();
    res.json(created);
    return;
  }

  const [updated] = await db
    .update(profileTable)
    .set(parsed.data)
    .where(eq(profileTable.id, profiles[0].id))
    .returning();
  res.json(updated);
});

export default router;
