import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import {
  Bell, Activity, Heart, MessageSquare, ChevronRight,
  CheckCircle, Clock, TrendingUp, Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function fmt12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr ?? "00"} ${period}`;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: { queryKey: getGetDashboardSummaryQueryKey() },
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  const total = summary?.todayRemindersTotal ?? 0;
  const completed = summary?.todayRemindersCompleted ?? 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const streak = summary?.checkinStreak ?? 0;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Hero Card */}
      <div className="gradient-card rounded-2xl p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} aria-hidden="true" />
            </div>
            <span className="text-sm font-semibold text-primary tracking-wide uppercase">
              Good {getTimeOfDay()}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Hello, {summary?.userName || "Friend"}
          </h1>
          <p className="text-[15px] text-muted-foreground mt-1.5 leading-relaxed">
            {summary?.motivationalMessage || "Wishing you a healthy and peaceful day."}
          </p>

          {/* Progress bar — only show when there are reminders */}
          {total > 0 ? (
            <div className="mt-4">
              <div className="flex justify-between text-[13px] mb-2">
                <span className="text-muted-foreground font-medium">Today's progress</span>
                <span className="font-semibold text-foreground">{completed}/{total} done</span>
              </div>
              <div className="w-full h-2.5 bg-border/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700"
                  style={{ width: completionPct > 0 ? `${completionPct}%` : "4px" }}
                  role="progressbar"
                  aria-valuenow={completionPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${completed} of ${total} reminders completed`}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2">
              <div className="h-2.5 flex-1 bg-border/60 rounded-full" />
              <span className="text-[12px] text-muted-foreground font-medium whitespace-nowrap">No reminders today</span>
            </div>
          )}
        </div>
      </div>

      {/* Check-In Prompt */}
      {!summary?.todayCheckinDone && (
        <Link href="/checkin">
          <Card className="border-secondary/25 bg-gradient-to-r from-secondary/8 to-transparent hover:border-secondary/40 transition-all duration-200 cursor-pointer group">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/15 flex items-center justify-center shrink-0 group-hover:bg-secondary/25 transition-colors">
                <Heart className="w-6 h-6 text-secondary" strokeWidth={2} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-[15px]">Daily Check-In</p>
                <p className="text-[13px] text-muted-foreground mt-0.5">How are you feeling today?</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors shrink-0" aria-hidden="true" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/reminders">
          <Card className="h-full hover:border-primary/40 hover:shadow-md hover:shadow-primary/8 transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                <Bell className="w-5 h-5 text-primary" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{total}</p>
                <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Reminders Today</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/health">
          <Card className="h-full hover:border-secondary/40 hover:shadow-md hover:shadow-secondary/8 transition-all duration-200 cursor-pointer group">
            <CardContent className="p-5 flex flex-col gap-3">
              <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/15 transition-colors">
                <Activity className="w-5 h-5 text-secondary" strokeWidth={2} aria-hidden="true" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{summary?.weeklyHealthRecords ?? 0}</p>
                <p className="text-[13px] text-muted-foreground font-medium mt-0.5">Vitals This Week</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* AI Assistant CTA */}
      <Link href="/assistant" className="block">
        <button
          className="w-full h-[60px] rounded-2xl bg-primary text-white font-semibold text-[15px] flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all duration-200"
          aria-label="Open Sahayak AI chat assistant"
        >
          <MessageSquare className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          Chat with Sahayak AI
          <ChevronRight className="w-4 h-4 opacity-70" aria-hidden="true" />
        </button>
      </Link>

      {/* Streak — plural-aware */}
      {streak > 0 && (
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-orange-500" strokeWidth={2} aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-[15px]">
                {streak}-day check-in streak
              </p>
              <p className="text-[13px] text-muted-foreground">
                {streak >= 7 ? "Incredible consistency — keep it up!" : "Keep checking in every day!"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Reminders */}
      {summary?.upcomingReminders && summary.upcomingReminders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-[15px] font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              Upcoming Today
            </h2>
            <Link href="/reminders">
              <span className="text-[13px] font-medium text-primary hover:underline">View all</span>
            </Link>
          </div>
          <div className="space-y-2">
            {summary.upcomingReminders.slice(0, 3).map((reminder) => (
              <Card key={reminder.id} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-accent-foreground/60" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-[15px] truncate">{reminder.title}</p>
                    <p className="text-[13px] text-muted-foreground">{fmt12h(reminder.time)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="h-2" />
    </div>
  );
}
