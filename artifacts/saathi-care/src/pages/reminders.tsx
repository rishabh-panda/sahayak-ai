import { useState } from "react";
import {
  useListReminders,
  useCreateReminder,
  useUpdateReminder,
  useDeleteReminder,
  getListRemindersQueryKey,
  getGetTodayRemindersQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2, Check, Clock, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const REMINDER_TYPES = [
  { value: "medication", label: "Medicine", emoji: "💊" },
  { value: "appointment", label: "Doctor Visit", emoji: "🏥" },
  { value: "exercise", label: "Exercise", emoji: "🧘" },
  { value: "meal", label: "Meal", emoji: "🍽️" },
  { value: "other", label: "Other", emoji: "📌" },
];

const typeEmoji = (t: string) => REMINDER_TYPES.find((r) => r.value === t)?.emoji ?? "📌";
const typeLabel = (t: string) => REMINDER_TYPES.find((r) => r.value === t)?.label ?? t;

export default function Reminders() {
  const { data: reminders = [], isLoading } = useListReminders({ query: { queryKey: getListRemindersQueryKey() } });
  const createReminder = useCreateReminder();
  const updateReminder = useUpdateReminder();
  const deleteReminder = useDeleteReminder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("medication");
  const [time, setTime] = useState("08:00");
  const [days, setDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListRemindersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTodayRemindersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const toggleDay = (day: string) => {
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const handleCreate = () => {
    if (!title.trim()) return;
    createReminder.mutate(
      { data: { title: title.trim(), type: type as "medication", time, daysOfWeek: days } },
      {
        onSuccess: () => {
          toast({ title: "Reminder Set!", description: `"${title}" will remind you at ${time}` });
          invalidate();
          setOpen(false);
          setTitle("");
          setType("medication");
          setTime("08:00");
          setDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
        },
      }
    );
  };

  const handleComplete = (id: number, completedToday: boolean) => {
    updateReminder.mutate(
      { id, data: { completedToday: !completedToday } },
      { onSuccess: invalidate }
    );
  };

  const handleDelete = (id: number, title: string) => {
    deleteReminder.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Reminder Removed", description: `"${title}" has been deleted.` });
          invalidate();
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reminders</h1>
          <p className="text-lg text-muted-foreground mt-1">Your daily schedule</p>
        </div>
        <Button
          data-testid="button-add-reminder"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : reminders.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Bell className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-xl font-medium text-muted-foreground text-center">No reminders yet</p>
            <p className="text-base text-muted-foreground text-center">Tap the + button to add your first reminder</p>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full mt-2" onClick={() => setOpen(true)}>
              <Plus className="w-5 h-5 mr-2" /> Add Reminder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <Card
              key={r.id}
              data-testid={`card-reminder-${r.id}`}
              className={`border-border/50 shadow-sm transition-all ${r.completedToday ? "opacity-60" : ""}`}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <button
                  data-testid={`button-complete-${r.id}`}
                  onClick={() => handleComplete(r.id, r.completedToday)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors text-2xl border-2 ${
                    r.completedToday
                      ? "bg-accent border-accent-foreground/20 text-accent-foreground"
                      : "border-border hover:border-primary hover:bg-primary/10"
                  }`}
                >
                  {r.completedToday ? <Check className="w-7 h-7" /> : typeEmoji(r.type)}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl font-bold text-foreground ${r.completedToday ? "line-through" : ""}`}>
                    {r.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-base font-medium">{r.time}</span>
                    </div>
                    <Badge variant="secondary" className="text-sm px-2 py-0.5">
                      {typeLabel(r.type)}
                    </Badge>
                  </div>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {r.daysOfWeek.map((d) => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  data-testid={`button-delete-${r.id}`}
                  onClick={() => handleDelete(r.id, r.title)}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">What to remind?</Label>
              <Input
                data-testid="input-reminder-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Take Blood Pressure Medicine"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-reminder-type" className="h-14 text-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value} className="text-lg py-3">
                      {rt.emoji} {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Time</Label>
              <Input
                data-testid="input-reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Days</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    data-testid={`button-day-${d}`}
                    onClick={() => toggleDay(d)}
                    className={`h-12 w-12 rounded-full text-sm font-bold transition-colors ${
                      days.includes(d)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {d.slice(0, 1)}
                  </button>
                ))}
              </div>
            </div>
            <Button
              data-testid="button-save-reminder"
              size="lg"
              className="w-full h-14 text-xl rounded-xl"
              onClick={handleCreate}
              disabled={!title.trim() || days.length === 0 || createReminder.isPending}
            >
              {createReminder.isPending ? "Saving..." : "Set Reminder"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
