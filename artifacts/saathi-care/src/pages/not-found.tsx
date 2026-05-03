import { Link } from "wouter";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background px-4">
      <div className="max-w-sm w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
          <SearchX className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="text-xl font-semibold text-foreground">Page Not Found</p>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            We could not find the page you were looking for. Let us take you back home.
          </p>
        </div>
        <Link href="/">
          <button className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-primary text-white font-semibold text-[15px] shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all duration-200">
            <Home className="w-4.5 h-4.5" strokeWidth={2} />
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
