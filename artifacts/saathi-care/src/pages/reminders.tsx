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
import {
  Bell, Plus, Trash2, CheckCircle2, Clock, Pill, Stethoscope, Dumbbell, UtensilsCrossed, CalendarDays,
} from "lucide-react";
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
  { value: "medication", label: "Medicine", Icon: Pill, color: "text-primary bg-primary/10" },
  { value: "appointment", label: "Doctor Visit", Icon: Stethoscope, color: "text-secondary bg-secondary/10" },
  { value: "exercise", label: "Exercise", Icon: Dumbbell, color: "text-orange-600 bg-orange-50" },
  { value: "meal", label: "Meal", Icon: UtensilsCrossed, color: "text-rose-500 bg-rose-50" },
  { value: "other", label: "Other", Icon: CalendarDays, color: "text-muted-foreground bg-muted" },
];

const getType = (t: string) => REMINDER_TYPES.find((r) => r.value === t) ?? REMINDER_TYPES[4];

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

  const toggleDay = (day: string) =>
    setDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);

  const handleCreate = () => {
    if (!title.trim()) return;
    createReminder.mutate(
      { data: { title: title.trim(), type: type as "medication", time, daysOfWeek: days } },
      {
        onSuccess: () => {
          toast({ title: "Reminder created", description: `"${title}" set for ${time}` });
          invalidate();
          setOpen(false);
          setTitle(""); setType("medication"); setTime("08:00");
          setDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
        },
      }
    );
  };

  const handleComplete = (id: number, completedToday: boolean) => {
    updateReminder.mutate({ id, data: { completedToday: !completedToday } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number, t: string) => {
    deleteReminder.mutate({ id }, {
      onSuccess: () => { toast({ title: "Reminder removed", description: `"${t}" deleted.` }); invalidate(); },
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Manage your daily schedule</p>
        </div>
        <button
          data-icon-only
          data-testid="button-add-reminder"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : reminders.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Bell className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-semibold text-foreground">No reminders yet</p>
            <p className="text-[14px] text-muted-foreground text-center">Add your first reminder to stay on schedule</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-2 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-[14px] flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => {
            const t = getType(r.type);
            const Icon = t.Icon;
            return (
              <Card
                key={r.id}
                data-testid={`card-reminder-${r.id}`}
                className={`border-border/60 transition-all duration-200 ${r.completedToday ? "opacity-55" : "hover:border-primary/30 hover:shadow-sm"}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {/* Complete toggle */}
                  <button
                    data-icon-only
                    data-testid={`button-complete-${r.id}`}
                    onClick={() => handleComplete(r.id, r.completedToday)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      r.completedToday
                        ? "bg-secondary/15 text-secondary"
                        : `${t.color} hover:scale-105`
                    }`}
                  >
                    {r.completedToday ? (
                      <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
                    ) : (
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-[15px] text-foreground ${r.completedToday ? "line-through text-muted-foreground" : ""}`}>
                      {r.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-[13px] text-muted-foreground font-medium">
                        <Clock className="w-3.5 h-3.5" /> {r.time}
                      </span>
                      <Badge variant="secondary" className="text-[11px] px-2 py-0 h-5 font-medium">
                        {t.label}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {r.daysOfWeek.map((d) => (
                        <span key={d} className="text-[11px] px-1.5 py-0.5 rounded-md bg-accent text-accent-foreground font-medium">
                          {d.slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    data-icon-only
                    data-testid={`button-delete-${r.id}`}
                    onClick={() => handleDelete(r.id, r.title)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">What to remind?</Label>
              <Input
                data-testid="input-reminder-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Take Blood Pressure Medicine"
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger data-testid="select-reminder-type" className="h-[52px] text-[15px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value} className="text-[15px] py-2.5">
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">Time</Label>
              <Input
                data-testid="input-reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">Days of week</Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d) => (
                  <button
                    key={d}
                    data-icon-only
                    data-testid={`button-day-${d}`}
                    onClick={() => toggleDay(d)}
                    className={`w-10 h-10 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                      days.includes(d)
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted text-muted-foreground hover:bg-accent"
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
              className="w-full h-[52px] text-[15px] font-semibold rounded-xl"
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
