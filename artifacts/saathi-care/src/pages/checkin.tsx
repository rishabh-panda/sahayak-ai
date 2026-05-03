import { useState } from "react";
import {
  useCreateCheckin,
  useGetCheckinHistory,
  getGetCheckinHistoryQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Laugh, Smile, Minus, Frown, Meh,
  Zap, Sun, Moon, CheckCircle,
} from "lucide-react";

type MoodOption = {
  value: string;
  label: string;
  Icon: React.ElementType;
  iconColor: string;
  selected: string;
  unselected: string;
};

type EnergyOption = {
  value: string;
  label: string;
  Icon: React.ElementType;
  iconColor: string;
  selected: string;
  unselected: string;
};

const MOODS: MoodOption[] = [
  {
    value: "very_happy", label: "Great", Icon: Laugh, iconColor: "text-green-600",
    selected: "bg-green-600 text-white border-green-600 shadow-md shadow-green-600/30",
    unselected: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    value: "happy", label: "Good", Icon: Smile, iconColor: "text-blue-500",
    selected: "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/30",
    unselected: "text-blue-500 bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    value: "okay", label: "Okay", Icon: Meh, iconColor: "text-yellow-500",
    selected: "bg-yellow-500 text-white border-yellow-500 shadow-md shadow-yellow-500/30",
    unselected: "text-yellow-500 bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
  },
  {
    value: "sad", label: "Low", Icon: Frown, iconColor: "text-orange-500",
    selected: "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/30",
    unselected: "text-orange-500 bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    value: "very_sad", label: "Very Low", Icon: Minus, iconColor: "text-rose-600",
    selected: "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/30",
    unselected: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
  },
];

const ENERGY: EnergyOption[] = [
  {
    value: "high", label: "High Energy", Icon: Zap, iconColor: "text-primary",
    selected: "bg-primary text-white border-primary shadow-md shadow-primary/30",
    unselected: "text-primary bg-primary/10 border-primary/20 hover:bg-primary/15",
  },
  {
    value: "medium", label: "Moderate", Icon: Sun, iconColor: "text-amber-500",
    selected: "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/30",
    unselected: "text-amber-500 bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    value: "low", label: "Fatigued", Icon: Moon, iconColor: "text-slate-500",
    selected: "bg-slate-500 text-white border-slate-500 shadow-md shadow-slate-500/30",
    unselected: "text-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100",
  },
];

/** Returns today's date string in IST (UTC+5:30) as YYYY-MM-DD */
function getISTDateString(): string {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split("T")[0];
}

export default function Checkin() {
  const { data: history = [], isLoading } = useGetCheckinHistory({
    query: { queryKey: getGetCheckinHistoryQueryKey() },
  });
  const createCheckin = useCreateCheckin();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const todayDate = getISTDateString();
  const checkedInToday = history.some((c) => c.date === todayDate);

  const handleSubmit = () => {
    if (!mood || !energy) return;
    createCheckin.mutate(
      { data: { mood: mood as "happy", energy: energy as "high", notes: notes.trim() || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Check-in complete", description: "Thank you for sharing how you feel today." });
          queryClient.invalidateQueries({ queryKey: getGetCheckinHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setSubmitted(true);
        },
        onError: () => {
          toast({ title: "Could not save check-in", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
    });

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Check-In</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Track your wellbeing every day</p>
      </div>

      {/* Form */}
      {!checkedInToday && !submitted ? (
        <Card className="border-border/60">
          <CardContent className="p-5 space-y-6">
            {/* Mood */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-foreground">
                How are you feeling?
                {!mood && <span className="text-[12px] text-muted-foreground font-normal ml-2">— please select one</span>}
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {MOODS.map((item) => {
                  const isSelected = mood === item.value;
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.value}
                      data-icon-only
                      data-testid={`button-mood-${item.value}`}
                      aria-label={`Mood: ${item.label}`}
                      aria-pressed={isSelected}
                      onClick={() => setMood(item.value)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 ${
                        isSelected ? item.selected : item.unselected
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-white" : item.iconColor}`} strokeWidth={2} />
                      <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-3">
              <Label className="text-[15px] font-semibold text-foreground">
                Energy level
                {!energy && <span className="text-[12px] text-muted-foreground font-normal ml-2">— please select one</span>}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {ENERGY.map((item) => {
                  const isSelected = energy === item.value;
                  const Icon = item.Icon;
                  return (
                    <button
                      key={item.value}
                      data-icon-only
                      data-testid={`button-energy-${item.value}`}
                      aria-label={`Energy: ${item.label}`}
                      aria-pressed={isSelected}
                      onClick={() => setEnergy(item.value)}
                      className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border-2 transition-all duration-200 ${
                        isSelected ? item.selected : item.unselected
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? "text-white" : item.iconColor}`} strokeWidth={2} />
                      <span className="text-[12px] font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[15px] font-semibold text-foreground">Notes (optional)</Label>
              <Input
                data-testid="input-checkin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Anything to note about today..."
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>

            <Button
              data-testid="button-submit-checkin"
              size="lg"
              className="w-full h-[52px] text-[15px] font-semibold rounded-xl"
              onClick={handleSubmit}
              disabled={!mood || !energy || createCheckin.isPending}
            >
              {createCheckin.isPending ? "Saving..." : "Submit Check-In"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-secondary/25 bg-secondary/5">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-secondary" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[18px] font-bold text-foreground">Checked in today</p>
              <p className="text-[14px] text-muted-foreground mt-1">Keep the habit going every day!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-[16px] font-semibold text-foreground mb-3">Check-In History</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-[14px] text-muted-foreground text-center py-8">No check-ins yet. Start today!</p>
        ) : (
          <div className="space-y-2">
            {history.map((c) => {
              const m = MOODS.find((item) => item.value === c.mood);
              const Icon = m?.Icon ?? Smile;
              const iconColor = m?.iconColor ?? "text-primary";
              const bgColor = m ? m.unselected.split(" ")[2] : "bg-muted";
              return (
                <Card key={c.id} data-testid={`card-checkin-${c.id}`} className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColor}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[15px] text-foreground">{m?.label ?? c.mood}</p>
                        <p className="text-[12px] text-muted-foreground">{formatDate(c.date)}</p>
                      </div>
                      {c.notes && (
                        <p className="text-[13px] text-muted-foreground mt-0.5 italic truncate">"{c.notes}"</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
