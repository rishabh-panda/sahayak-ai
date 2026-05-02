import { Link, useLocation } from "wouter";
import { ReactNode } from "react";
import { Home, Bell, Pill, Activity, MessageSquare, Users, Lightbulb, UserCircle, BrainCircuit } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/reminders", icon: Bell, label: "Reminders" },
    { href: "/medications", icon: Pill, label: "Medicines" },
    { href: "/health", icon: Activity, label: "Health" },
    { href: "/assistant", icon: MessageSquare, label: "Sahayak" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background w-full mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/60 px-5 h-16 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <BrainCircuit className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[17px] text-foreground tracking-tight">Sahayak</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary tracking-wider uppercase">AI</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link href="/tips">
            <button
              data-icon-only
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200"
            >
              <Lightbulb className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/contacts">
            <button
              data-icon-only
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200"
            >
              <Users className="w-5 h-5" />
            </button>
          </Link>
          <Link href="/profile">
            <button
              data-icon-only
              className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-accent transition-all duration-200"
            >
              <UserCircle className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/60 shadow-[0_-8px_32px_rgba(0,0,0,0.06)]">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex-1">
                <div className="flex flex-col items-center justify-center py-1.5 gap-1 cursor-pointer group">
                  <div
                    className={`flex items-center justify-center w-12 h-10 rounded-xl transition-all duration-200 ${
                      active
                        ? "bg-primary shadow-md shadow-primary/25"
                        : "group-hover:bg-accent"
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={active ? 2.5 : 2}
                      className={active ? "text-white" : "text-muted-foreground group-hover:text-primary"}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
