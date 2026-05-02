import { db, remindersTable, medicationsTable, contactsTable, tipsTable } from "@workspace/db";

export async function seedInitialData() {
  // Seed tips
  const existingTips = await db.select().from(tipsTable).limit(1);
  if (existingTips.length === 0) {
    await db.insert(tipsTable).values([
      {
        title: "Stay Hydrated",
        content: "Drink at least 8 glasses of water daily. Staying hydrated helps your joints, digestion, and keeps your mind sharp. Keep a water bottle nearby at all times.",
        category: "health",
        language: "en",
        emoji: "💧",
      },
      {
        title: "Morning Walk",
        content: "A 15-minute morning walk can improve your mood, reduce blood pressure, and boost your energy for the day. Start small and increase gradually.",
        category: "wellness",
        language: "en",
        emoji: "🌅",
      },
      {
        title: "Call a Loved One",
        content: "Social connection is one of the best medicines. Call a family member or old friend today — even a 5-minute chat can lift your spirits greatly.",
        category: "social",
        language: "en",
        emoji: "📞",
      },
      {
        title: "Medicine on Time",
        content: "Taking your medicines at the same time every day is very important. Set an alarm or ask a family member to remind you if needed.",
        category: "health",
        language: "en",
        emoji: "💊",
      },
      {
        title: "Practice Gratitude",
        content: "Every morning, think of 3 things you are thankful for. This simple habit reduces stress, improves sleep, and brings more joy into your daily life.",
        category: "spiritual",
        language: "en",
        emoji: "🙏",
      },
      // Hindi tips
      {
        title: "पानी पीते रहें",
        content: "दिन में कम से कम 8 गिलास पानी पिएं। पानी आपके जोड़ों, पाचन और दिमाग को तंदुरुस्त रखता है। हमेशा पास में पानी की बोतल रखें।",
        category: "health",
        language: "hi",
        emoji: "💧",
      },
      {
        title: "सुबह की सैर",
        content: "15 मिनट की सुबह की सैर आपका मूड सुधारती है, रक्तचाप कम करती है और दिन भर के लिए ऊर्जा देती है। धीरे-धीरे शुरू करें और समय बढ़ाते जाएं।",
        category: "wellness",
        language: "hi",
        emoji: "🌅",
      },
      {
        title: "परिवार से बात करें",
        content: "आज किसी परिवार के सदस्य या पुराने दोस्त को फ़ोन करें। सामाजिक संबंध सबसे अच्छी दवा है। यहां तक कि 5 मिनट की बातचीत भी आपका मन खुश कर सकती है।",
        category: "social",
        language: "hi",
        emoji: "📞",
      },
      {
        title: "दवाई समय पर लें",
        content: "हर दिन एक ही समय पर दवाइयाँ लेना बहुत ज़रूरी है। अलार्म लगाएं या किसी परिवार के सदस्य से याद दिलाने को कहें।",
        category: "health",
        language: "hi",
        emoji: "💊",
      },
      {
        title: "कृतज्ञता अभ्यास",
        content: "हर सुबह 3 चीज़ें सोचें जिनके लिए आप आभारी हैं। यह साधारण आदत तनाव कम करती है, नींद सुधारती है और जीवन में खुशी लाती है।",
        category: "spiritual",
        language: "hi",
        emoji: "🙏",
      },
    ]);
  }

  // Seed one example reminder
  const existingReminders = await db.select().from(remindersTable).limit(1);
  if (existingReminders.length === 0) {
    await db.insert(remindersTable).values([
      {
        title: "Morning Medicine",
        description: "Take blood pressure medicine with water",
        type: "medication",
        time: "08:00",
        daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        isActive: true,
        completedToday: false,
      },
      {
        title: "Evening Walk",
        description: "15 minute walk in the park",
        type: "exercise",
        time: "18:00",
        daysOfWeek: ["Mon", "Wed", "Fri", "Sat", "Sun"],
        isActive: true,
        completedToday: false,
      },
    ]);
  }

  // Seed one example medication
  const existingMeds = await db.select().from(medicationsTable).limit(1);
  if (existingMeds.length === 0) {
    await db.insert(medicationsTable).values([
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "Twice daily",
        times: ["08:00", "20:00"],
        instructions: "Take after meals",
        prescribedBy: "Dr. Sharma",
        isActive: true,
      },
    ]);
  }

  // Seed example contact
  const existingContacts = await db.select().from(contactsTable).limit(1);
  if (existingContacts.length === 0) {
    await db.insert(contactsTable).values([
      {
        name: "Emergency Contact",
        relationship: "son",
        phone: "9876543210",
        isEmergency: true,
      },
    ]);
  }
}
