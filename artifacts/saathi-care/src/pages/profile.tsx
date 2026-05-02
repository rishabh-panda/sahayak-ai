import { useState, useEffect } from "react";
import {
  useGetProfile,
  useUpdateProfile,
  getGetProfileQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Globe, Settings, BrainCircuit } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी — Hindi" },
  { code: "ta", label: "தமிழ் — Tamil" },
  { code: "te", label: "తెలుగు — Telugu" },
  { code: "bn", label: "বাংলা — Bengali" },
  { code: "mr", label: "मराठी — Marathi" },
  { code: "gu", label: "ગુજરાતી — Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ — Kannada" },
  { code: "ml", label: "മലയാളം — Malayalam" },
  { code: "pa", label: "ਪੰਜਾਬੀ — Punjabi" },
  { code: "or", label: "ଓଡ଼ିଆ — Odia" },
  { code: "as", label: "অসমীয়া — Assamese" },
  { code: "ur", label: "اردو — Urdu" },
];

const FONT_SIZES = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large (Recommended)" },
  { value: "xlarge", label: "Extra Large" },
];

const THEMES = [
  { value: "light", label: "Light Mode" },
  { value: "dark", label: "Dark Mode" },
  { value: "high-contrast", label: "High Contrast" },
];

export default function Profile() {
  const { data: profile, isLoading } = useGetProfile({ query: { queryKey: getGetProfileQueryKey() } });
  const updateProfile = useUpdateProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("en");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [fontSize, setFontSize] = useState("large");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setCity(profile.city ?? "");
      setLanguage(profile.language ?? "en");
      setEmergencyPhone(profile.emergencyPhone ?? "");
      setFontSize(profile.fontSize ?? "large");
      setTheme(profile.theme ?? "light");
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile.mutate(
      {
        data: {
          name: name.trim(),
          age: age ? parseInt(age, 10) : undefined,
          city: city.trim() || undefined,
          language,
          emergencyPhone: emergencyPhone.trim() || undefined,
          fontSize: fontSize as "large",
          theme: theme as "light",
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Profile saved", description: "Your settings have been updated." });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Profile Hero */}
      <div className="gradient-card rounded-2xl p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
          <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">{profile?.name || "Your Profile"}</h1>
          <p className="text-[14px] text-muted-foreground mt-0.5">{profile?.city || "Add your city"}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            <span className="text-[12px] font-semibold text-primary">Sahayak-AI Member</span>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {[
            { label: "Your Name", value: name, setter: setName, placeholder: "e.g. Ramesh Sharma", testId: "input-profile-name", type: "text" },
            { label: "Your Age", value: age, setter: setAge, placeholder: "e.g. 68", testId: "input-profile-age", type: "number" },
            { label: "City", value: city, setter: setCity, placeholder: "e.g. Mumbai", testId: "input-profile-city", type: "text" },
            { label: "Emergency Phone", value: emergencyPhone, setter: setEmergencyPhone, placeholder: "e.g. 9876543210", testId: "input-profile-emergency", type: "tel" },
          ].map(({ label, value, setter, placeholder, testId, type }) => (
            <div key={testId} className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">{label}</Label>
              <Input
                data-testid={testId}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                type={type}
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Language Preference
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger data-testid="select-language" className="h-[52px] text-[15px] rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code} className="text-[15px] py-2.5">{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Display */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 pt-4 px-5">
          <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[14px] font-semibold">Text Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger data-testid="select-font-size" className="h-[52px] text-[15px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-[15px] py-2.5">{f.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[14px] font-semibold">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger data-testid="select-theme" className="h-[52px] text-[15px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-[15px] py-2.5">{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button
        data-testid="button-save-profile"
        size="lg"
        className="w-full h-[52px] text-[15px] font-semibold rounded-xl shadow-md shadow-primary/20"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        <Save className="w-4.5 h-4.5 mr-2" />
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>

      <div className="h-2" />
    </div>
  );
}
