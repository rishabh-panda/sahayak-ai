import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Link } from "wouter";
import { CheckCircle2, ChevronRight, Activity, Heart, Bell, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary({ query: { queryKey: ["/api/dashboard"] } });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 shadow-sm border border-primary/10">
        <img 
          src="/sunrise-bg.png" 
          alt="Sunrise" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-foreground">
            Namaste, {summary?.userName || "Friend"} <span className="text-3xl">🙏</span>
          </h1>
          <p className="text-xl text-muted-foreground mt-2 font-medium">
            {summary?.motivationalMessage || "Wishing you a beautiful and healthy day ahead."}
          </p>
        </div>
      </div>

      {/* Daily Check-in Prompt */}
      {!summary?.todayCheckinDone && (
        <Card className="bg-secondary/20 border-secondary/30 overflow-hidden relative shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center shrink-0">
                <Heart className="w-8 h-8 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-1">How are you feeling?</h3>
                <p className="text-base text-muted-foreground">Log your mood for today.</p>
              </div>
              <Link href="/checkin">
                <Button className="shrink-0 rounded-full w-14 h-14 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md">
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/reminders">
          <Card className="h-full hover:bg-accent/10 transition-colors border-border/50 shadow-sm cursor-pointer group">
            <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{summary?.todayRemindersTotal || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Reminders Today</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/health">
          <Card className="h-full hover:bg-accent/10 transition-colors border-border/50 shadow-sm cursor-pointer group">
            <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full gap-3">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-destructive" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{summary?.weeklyHealthRecords || 0}</p>
                <p className="text-sm font-medium text-muted-foreground mt-1">Vitals Logged</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Action Button to Assistant */}
      <Link href="/assistant" className="block w-full">
        <Button size="lg" className="w-full h-20 text-xl rounded-2xl bg-primary text-primary-foreground shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-transform">
          <MessageCircle className="w-8 h-8" />
          Talk to your Saathi
        </Button>
      </Link>

      {/* Upcoming Reminders Preview */}
      {summary?.upcomingReminders && summary.upcomingReminders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground px-1">Upcoming Today</h2>
          <div className="space-y-3">
            {summary.upcomingReminders.slice(0, 3).map((reminder) => (
              <Card key={reminder.id} className="border-border/50 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-accent-foreground opacity-50" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-foreground">{reminder.title}</h4>
                    <p className="text-muted-foreground">{reminder.time}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div className="h-8"></div>
    </div>
  );
}
