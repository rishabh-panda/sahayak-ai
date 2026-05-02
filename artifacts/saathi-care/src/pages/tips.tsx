import { useState } from "react";
import { useGetDailyTips, useGetProfile, getGetDailyTipsQueryKey, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ml", label: "മലയാളം" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
];

const CATEGORY_COLORS: Record<string, string> = {
  health: "bg-destructive/10 text-destructive",
  wellness: "bg-accent/30 text-accent-foreground",
  technology: "bg-primary/10 text-primary",
  social: "bg-secondary/20 text-secondary-foreground",
  spiritual: "bg-purple-100 text-purple-700",
  nutrition: "bg-green-100 text-green-700",
};

export default function Tips() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const [lang, setLang] = useState(profile?.language ?? "en");

  const { data: tips = [], isLoading } = useGetDailyTips(
    { language: lang },
    { query: { queryKey: getGetDailyTipsQueryKey({ language: lang }) } }
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Tips</h1>
        <p className="text-lg text-muted-foreground mt-1">Wisdom for a healthy life</p>
      </div>

      {/* Language selector */}
      <div className="space-y-2">
        <p className="text-base font-semibold text-muted-foreground">Select Language</p>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              data-testid={`button-lang-${l.code}`}
              onClick={() => setLang(l.code)}
              className={`px-4 py-2 rounded-full text-base font-medium transition-colors border ${
                lang === l.code
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : "bg-card text-foreground border-border hover:bg-muted"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : tips.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Lightbulb className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-xl font-medium text-muted-foreground text-center">No tips available in this language yet</p>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full mt-2" onClick={() => setLang("en")}>
              View English Tips
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tips.map((tip) => (
            <Card key={tip.id} data-testid={`card-tip-${tip.id}`} className="border-border/50 shadow-sm overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {tip.emoji && <span className="text-4xl shrink-0 mt-0.5">{tip.emoji}</span>}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground leading-tight">{tip.title}</h3>
                      <Badge className={`shrink-0 capitalize text-xs ${CATEGORY_COLORS[tip.category] ?? "bg-muted"}`}>
                        {tip.category}
                      </Badge>
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{tip.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
