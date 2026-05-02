import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Home, Bell, Pill, Activity, MessageCircle, Users, Lightbulb, UserCircle } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/reminders", icon: Bell, label: "Reminders" },
    { href: "/medications", icon: Pill, label: "Meds" },
    { href: "/health", icon: Activity, label: "Health" },
    { href: "/assistant", icon: MessageCircle, label: "Saathi" },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background w-full mx-auto relative overflow-hidden">
      <header className="sticky top-0 z-50 bg-primary/10 backdrop-blur-sm border-b border-primary/20 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-inner">
            S
          </div>
          <span className="font-bold text-xl text-primary tracking-tight">SaathiCare</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/tips" className="p-2 bg-card rounded-full shadow-sm hover:bg-muted transition-colors">
            <Lightbulb className="w-6 h-6 text-secondary" />
          </Link>
          <Link href="/contacts" className="p-2 bg-card rounded-full shadow-sm hover:bg-muted transition-colors">
            <Users className="w-6 h-6 text-primary" />
          </Link>
          <Link href="/profile" className="p-2 bg-card rounded-full shadow-sm hover:bg-muted transition-colors">
            <UserCircle className="w-6 h-6 text-primary" />
          </Link>
        </div>
      </header>

      <main className="flex-1 pb-24 overflow-y-auto relative z-10 w-full max-w-2xl mx-auto px-4 pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-2 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-2xl mx-auto flex justify-between w-full">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href} className="w-1/5">
                <div className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all cursor-pointer ${isActive ? "text-primary scale-110" : "text-muted-foreground hover:bg-muted/50"}`}>
                  <div className={`relative p-2 rounded-full ${isActive ? "bg-primary/10" : ""}`}>
                    <Icon size={32} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : ""} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={`text-[11px] font-medium mt-1 tracking-wide ${isActive ? "text-primary" : ""}`}>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
