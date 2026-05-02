import { Router } from "express";
import { db, contactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateContactBody, DeleteContactParams } from "@workspace/api-zod";

const router = Router();

router.get("/contacts", async (req, res): Promise<void> => {
  const contacts = await db.select().from(contactsTable).orderBy(contactsTable.name);
  res.json(contacts);
});

router.post("/contacts", async (req, res): Promise<void> => {
  const parsed = CreateContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [contact] = await db.insert(contactsTable).values(parsed.data).returning();
  res.status(201).json(contact);
});

router.delete("/contacts/:id", async (req, res): Promise<void> => {
  const params = DeleteContactParams.safeParse({ id: req.params.id });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db.delete(contactsTable).where(eq(contactsTable.id, params.data.id));
  res.status(204).end();
});

export default router;
