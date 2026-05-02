import { Router } from "express";
import {
  db,
  profileTable,
  remindersTable,
  medicationsTable,
  checkinsTable,
  healthRecordsTable,
} from "@workspace/db";
import { eq, desc, gte } from "drizzle-orm";

const router = Router();

const motivationalMessages = [
  "Every sunrise brings a new opportunity to live well. You are doing great!",
  "Small healthy habits today lead to a stronger tomorrow. Keep it up!",
  "You are loved and cared for. Have a wonderful day!",
  "Remember to smile — it's the best medicine! Wishing you a healthy day.",
  "You inspire those around you. Stay strong and stay healthy!",
  "Today is a gift. Take care of yourself and enjoy every moment.",
  "Jeevan mein sukh aur swasthya ka aashirwad mile aapko aaj bhi!",
];

const getDayOfWeek = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[new Date().getDay()];
};

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  const today = getDayOfWeek();
  const todayDate = new Date().toISOString().split("T")[0];

  const [profiles, allReminders, medications, todayCheckins] = await Promise.all([
    db.select().from(profileTable).limit(1),
    db.select().from(remindersTable).where(eq(remindersTable.isActive, true)),
    db.select().from(medicationsTable).where(eq(medicationsTable.isActive, true)),
    db.select().from(checkinsTable).where(eq(checkinsTable.date, todayDate)),
  ]);

  const profile = profiles[0];
  const userName = profile?.name ?? "Friend";

  const todayReminders = allReminders.filter((r) => r.daysOfWeek.includes(today));
  const completedToday = todayReminders.filter((r) => r.completedToday);

  // Checkin streak calculation
  const recentCheckins = await db
    .select()
    .from(checkinsTable)
    .orderBy(desc(checkinsTable.date))
    .limit(30);

  let streak = 0;
  const checkDates = new Set(recentCheckins.map((c) => c.date));
  const checkDate = new Date();
  while (checkDates.has(checkDate.toISOString().split("T")[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const todayCheckinDone = todayCheckins.length > 0;
  const latestCheckin = recentCheckins[0];

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyHealthRecords = await db
    .select()
    .from(healthRecordsTable)
    .where(gte(healthRecordsTable.recordedAt, oneWeekAgo));

  const upcomingReminders = todayReminders
    .filter((r) => !r.completedToday)
    .slice(0, 3);

  const motivationalMessage =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  res.json({
    userName,
    todayRemindersTotal: todayReminders.length,
    todayRemindersCompleted: completedToday.length,
    checkinStreak: streak,
    todayCheckinDone,
    activeMedicationsCount: medications.length,
    latestMood: latestCheckin?.mood ?? null,
    weeklyHealthRecords: weeklyHealthRecords.length,
    upcomingReminders,
    motivationalMessage,
  });
});

export default router;
