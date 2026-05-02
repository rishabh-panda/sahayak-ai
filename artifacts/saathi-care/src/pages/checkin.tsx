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

const MOODS = [
  { value: "very_happy", emoji: "😄", label: "Very Happy" },
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "sad", emoji: "😔", label: "Sad" },
  { value: "very_sad", emoji: "😢", label: "Very Sad" },
];

const ENERGY = [
  { value: "high", emoji: "⚡", label: "High Energy" },
  { value: "medium", emoji: "🔆", label: "Medium" },
  { value: "low", emoji: "😴", label: "Tired" },
];

const moodEmoji = (m: string) => MOODS.find((x) => x.value === m)?.emoji ?? "😊";
const moodLabel = (m: string) => MOODS.find((x) => x.value === m)?.label ?? m;

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

  const todayDate = new Date().toISOString().split("T")[0];
  const checkedInToday = history.some((c) => c.date === todayDate);

  const handleSubmit = () => {
    if (!mood || !energy) return;
    createCheckin.mutate(
      { data: { mood: mood as "happy", energy: energy as "high", notes: notes.trim() || undefined } },
      {
        onSuccess: () => {
          toast({ title: "Check-in Done!", description: "Thank you for sharing how you feel today." });
          queryClient.invalidateQueries({ queryKey: getGetCheckinHistoryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
          setSubmitted(true);
          setMood("");
          setEnergy("");
          setNotes("");
        },
      }
    );
  };

  const formatDate = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Daily Check-In</h1>
        <p className="text-lg text-muted-foreground mt-1">How are you feeling today?</p>
      </div>

      {/* Today's Check-In Form */}
      {!checkedInToday && !submitted ? (
        <Card className="border-primary/20 shadow-md">
          <CardContent className="p-6 space-y-6">
            {/* Mood */}
            <div className="space-y-3">
              <Label className="text-xl font-bold">Your Mood</Label>
              <div className="flex gap-3 flex-wrap">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    data-testid={`button-mood-${m.value}`}
                    onClick={() => setMood(m.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all border-2 min-w-[64px] ${
                      mood === m.value
                        ? "border-primary bg-primary/10 scale-110 shadow-md"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <span className="text-4xl">{m.emoji}</span>
                    <span className="text-xs font-medium text-muted-foreground">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="space-y-3">
              <Label className="text-xl font-bold">Energy Level</Label>
              <div className="flex gap-3 flex-wrap">
                {ENERGY.map((e) => (
                  <button
                    key={e.value}
                    data-testid={`button-energy-${e.value}`}
                    onClick={() => setEnergy(e.value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all border-2 min-w-[80px] ${
                      energy === e.value
                        ? "border-secondary bg-secondary/20 scale-110 shadow-md"
                        : "border-border hover:border-secondary/40"
                    }`}
                  >
                    <span className="text-4xl">{e.emoji}</span>
                    <span className="text-xs font-medium text-muted-foreground">{e.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-xl font-bold">Any notes? (optional)</Label>
              <Input
                data-testid="input-checkin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Slept well, feeling rested..."
                className="h-14 text-lg rounded-xl"
              />
            </div>

            <Button
              data-testid="button-submit-checkin"
              size="lg"
              className="w-full h-16 text-xl rounded-2xl"
              onClick={handleSubmit}
              disabled={!mood || !energy || createCheckin.isPending}
            >
              {createCheckin.isPending ? "Saving..." : "Submit Check-In"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <span className="text-6xl">{mood ? moodEmoji(mood) : "✅"}</span>
            <p className="text-2xl font-bold text-foreground">You've checked in today!</p>
            <p className="text-lg text-muted-foreground">Thank you for sharing how you feel. Keep it up every day!</p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Your Check-In History</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-lg text-muted-foreground text-center py-8">No check-ins yet. Start today!</p>
        ) : (
          <div className="space-y-3">
            {history.map((c) => (
              <Card key={c.id} data-testid={`card-checkin-${c.id}`} className="border-border/40 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-4xl">{moodEmoji(c.mood)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-foreground">{moodLabel(c.mood)}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(c.date)}</p>
                    </div>
                    {c.notes && <p className="text-sm text-muted-foreground mt-1 italic">"{c.notes}"</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
