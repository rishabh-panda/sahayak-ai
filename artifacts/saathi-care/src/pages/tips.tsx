import { useState, useEffect } from "react";
import { useGetDailyTips, useGetProfile, getGetDailyTipsQueryKey, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Lightbulb, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const LANGUAGES = [
  { code: "en", label: "EN", full: "English" },
  { code: "hi", label: "हि", full: "Hindi" },
  { code: "ta", label: "த", full: "Tamil" },
  { code: "te", label: "తె", full: "Telugu" },
  { code: "bn", label: "বা", full: "Bengali" },
  { code: "mr", label: "म", full: "Marathi" },
  { code: "gu", label: "ગુ", full: "Gujarati" },
  { code: "kn", label: "ಕ", full: "Kannada" },
  { code: "ml", label: "മ", full: "Malayalam" },
  { code: "pa", label: "ਪੰ", full: "Punjabi" },
];

const CATEGORY_STYLES: Record<string, string> = {
  health: "bg-rose-50 text-rose-600 border-rose-200",
  wellness: "bg-secondary/10 text-secondary border-secondary/20",
  technology: "bg-primary/10 text-primary border-primary/20",
  social: "bg-blue-50 text-blue-600 border-blue-200",
  spiritual: "bg-purple-50 text-purple-600 border-purple-200",
  nutrition: "bg-green-50 text-green-600 border-green-200",
};

export default function Tips() {
  const { data: profile } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const [lang, setLang] = useState<string>("en");
  const [initialized, setInitialized] = useState(false);

  // Sync language with profile preference once loaded (fix #4)
  useEffect(() => {
    if (profile?.language && !initialized) {
      const supported = LANGUAGES.find((l) => l.code === profile.language);
      if (supported) setLang(profile.language);
      setInitialized(true);
    }
  }, [profile?.language, initialized]);

  const { data: tips = [], isLoading } = useGetDailyTips(
    { language: lang },
    { query: { queryKey: getGetDailyTipsQueryKey({ language: lang }) } }
  );

  const currentLangFull = LANGUAGES.find((l) => l.code === lang)?.full ?? "English";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Tips</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Wellness guidance in your language</p>
      </div>

      {/* Language Selector */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
            Language — {currentLangFull}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Select language for tips">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              data-icon-only
              data-testid={`button-lang-${l.code}`}
              onClick={() => setLang(l.code)}
              aria-label={l.full}
              aria-pressed={lang === l.code}
              title={l.full}
              className={`min-w-[44px] h-9 px-3 rounded-xl text-[13px] font-semibold border-2 transition-all duration-200 ${
                lang === l.code
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card text-foreground border-border hover:border-primary/40 hover:bg-accent"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : tips.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Lightbulb className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-semibold text-foreground">No tips in {currentLangFull} yet</p>
            <p className="text-[14px] text-muted-foreground text-center">English tips are always available</p>
            <Button size="lg" className="h-11 px-6 text-[14px] rounded-xl mt-1" onClick={() => setLang("en")}>
              View English Tips
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => (
            <Card
              key={tip.id}
              data-testid={`card-tip-${tip.id}`}
              className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-[16px] font-bold text-foreground leading-snug flex-1">{tip.title}</h3>
                  <Badge
                    variant="outline"
                    className={`shrink-0 capitalize text-[11px] font-semibold px-2 h-5 border ${
                      CATEGORY_STYLES[tip.category] ?? "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-[14px] text-muted-foreground leading-relaxed">{tip.content}</p>
                <div className="mt-3 h-0.5 w-8 rounded-full bg-gradient-to-r from-primary to-secondary opacity-50" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
