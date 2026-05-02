import { Router } from "express";
import { SendAiMessageBody } from "@workspace/api-zod";

const router = Router();

const motivationalResponses: Record<string, string[]> = {
  en: [
    "You are doing wonderfully! Remember to take your medicines on time and stay hydrated.",
    "Every day is a blessing. Take a short walk today — even 10 minutes is great for your health!",
    "Your family loves you. Don't forget to call someone you care about today.",
    "Sleep well, eat well, and smile often. You are stronger than you know!",
    "Keep going! Small steps every day lead to big improvements in health.",
  ],
  hi: [
    "आप बहुत अच्छा कर रहे हैं! अपनी दवाइयाँ समय पर लें और पानी पीते रहें।",
    "हर दिन एक आशीर्वाद है। आज थोड़ी सैर करें — 10 मिनट भी आपकी सेहत के लिए अच्छे हैं!",
    "आपका परिवार आपसे प्यार करता है। आज किसी प्रिय को फ़ोन करें।",
    "अच्छी नींद लें, अच्छा खाएं, और मुस्कुराते रहें। आप जितना सोचते हैं उससे भी ज़्यादा मज़बूत हैं!",
  ],
  ta: [
    "நீங்கள் மிகவும் நன்றாக செய்கிறீர்கள்! மருந்துகளை சரியான நேரத்தில் எடுத்துக்கொள்ளுங்கள்.",
    "ஒவ்வொரு நாளும் ஒரு ஆசீர்வாதம். இன்று கொஞ்சம் நடையாடுங்கள்!",
  ],
  te: [
    "మీరు చాలా బాగా చేస్తున్నారు! మందులు సమయానికి తీసుకోండి.",
    "ప్రతి రోజూ ఒక వరం. ఈ రోజు కొంచెం నడవండి!",
  ],
};

const getAiResponse = (message: string, language: string): { reply: string; suggestions: string[] } => {
  const lowerMsg = message.toLowerCase();
  const lang = language in motivationalResponses ? language : "en";
  const responses = motivationalResponses[lang];
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];

  let reply = randomResponse;
  const suggestions: string[] = [];

  if (lowerMsg.includes("medicine") || lowerMsg.includes("dawa") || lowerMsg.includes("tablet") || lowerMsg.includes("दवाई")) {
    reply = lang === "hi"
      ? "दवाइयाँ हमेशा खाने के बाद लें जब तक डॉक्टर ने अन्यथा न कहा हो। पानी के साथ लें और याद के लिए अलार्म लगाएं।"
      : "Always take medicines after food unless your doctor says otherwise. Use water to swallow them, and set a reminder so you never miss a dose.";
    suggestions.push("Set medication reminder", "View my medications", "Call doctor");
  } else if (lowerMsg.includes("pain") || lowerMsg.includes("dard") || lowerMsg.includes("दर्द")) {
    reply = lang === "hi"
      ? "मुझे खेद है कि आपको दर्द हो रहा है। कृपया अपने डॉक्टर से संपर्क करें। क्या आप अभी किसी परिवार के सदस्य को कॉल करना चाहेंगे?"
      : "I'm sorry you're in pain. Please contact your doctor. Would you like to call a family member right now?";
    suggestions.push("Call family member", "Find nearby hospital", "See emergency contacts");
  } else if (lowerMsg.includes("blood pressure") || lowerMsg.includes("bp") || lowerMsg.includes("रक्तचाप")) {
    reply = lang === "hi"
      ? "रक्तचाप की निगरानी महत्वपूर्ण है। नियमित रूप से मापें, नमक कम खाएं, और रोज सैर करें। अपना रीडिंग यहाँ दर्ज करें।"
      : "Monitoring blood pressure is important. Measure it regularly, reduce salt intake, and walk daily. You can log your reading here.";
    suggestions.push("Log blood pressure", "View health history", "Set reminder");
  } else if (lowerMsg.includes("lonely") || lowerMsg.includes("akela") || lowerMsg.includes("अकेला")) {
    reply = lang === "hi"
      ? "आप अकेले नहीं हैं। आपका परिवार और दोस्त आपसे प्यार करते हैं। किसी को कॉल करें या हमारी टिप्स देखें।"
      : "You are not alone! Your family and friends love you. How about calling someone right now, or reading today's tips for some positivity?";
    suggestions.push("Call family", "View daily tips", "Read community posts");
  } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("namaste") || lowerMsg.includes("नमस्ते")) {
    reply = lang === "hi"
      ? "नमस्ते! मैं आपका सहायक हूँ। आज मैं आपकी कैसे मदद कर सकता हूँ?"
      : "Namaste! I'm your SaathiCare assistant. How can I help you today? You can ask me about your medicines, health tips, or anything you need!";
    suggestions.push("What can you help with?", "Set a reminder", "Health tips today", "Call family");
  } else {
    suggestions.push("Set a reminder", "Log health reading", "View daily tips", "Call family");
  }

  return { reply, suggestions };
};

router.post("/ai/chat", async (req, res): Promise<void> => {
  const parsed = SendAiMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { message, language } = parsed.data;

  try {
    // Use Replit AI if available
    const openaiModule = await import("openai").catch(() => null);
    if (openaiModule) {
      const OpenAI = openaiModule.default;
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "sk-placeholder",
        baseURL: process.env.OPENAI_BASE_URL,
      });

      const systemPrompt = `You are SaathiCare, a warm, patient, and caring AI assistant for Indian senior citizens aged 50 and above. 
Your name means "companion" in Hindi.
You speak simply and clearly, using short sentences. 
You are helpful with health reminders, medication queries, family communication, and daily wellness tips.
You respond in the language the user writes in. If they write in Hindi or another Indian language, respond in that language.
If they write in English, respond in clear simple English.
You are never dismissive. Always be encouraging and supportive.
Current user language preference: ${language}`;

      const conversationHistory = (parsed.data.conversationHistory ?? []).map(
        (m) => ({ role: m.role as "user" | "assistant", content: m.content })
      );

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationHistory,
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const reply = completion.choices[0]?.message?.content ?? "I'm here to help you!";
      res.json({ reply, suggestions: ["Set a reminder", "Log health reading", "View tips", "Call family"] });
      return;
    }
  } catch {
    // Fall through to simple response
  }

  const result = getAiResponse(message, language ?? "en");
  res.json(result);
});

export default router;
