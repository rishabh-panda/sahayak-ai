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
import { UserCircle, Save } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "ta", label: "தமிழ் (Tamil)" },
  { code: "te", label: "తెలుగు (Telugu)" },
  { code: "bn", label: "বাংলা (Bengali)" },
  { code: "mr", label: "मराठी (Marathi)" },
  { code: "gu", label: "ગુજરાતી (Gujarati)" },
  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml", label: "മലയാളം (Malayalam)" },
  { code: "pa", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "or", label: "ଓଡ଼ିଆ (Odia)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "ur", label: "اردو (Urdu)" },
];

const FONT_SIZES = [
  { value: "normal", label: "Normal" },
  { value: "large", label: "Large (Recommended)" },
  { value: "xlarge", label: "Extra Large" },
];

const THEMES = [
  { value: "light", label: "Light (Default)" },
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
          toast({ title: "Profile Saved!", description: "Your settings have been updated." });
          queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-5xl">
          👤
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{profile?.name || "Your Profile"}</h1>
          <p className="text-lg text-muted-foreground">{profile?.city || "Add your city"}</p>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Your Name</Label>
            <Input
              data-testid="input-profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="h-14 text-lg rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Your Age</Label>
            <Input
              data-testid="input-profile-age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 68"
              type="number"
              className="h-14 text-lg rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Your City</Label>
            <Input
              data-testid="input-profile-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Mumbai"
              className="h-14 text-lg rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Emergency Phone</Label>
            <Input
              data-testid="input-profile-emergency"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              type="tel"
              className="h-14 text-lg rounded-xl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Language Preference</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger data-testid="select-language" className="h-14 text-lg rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code} className="text-lg py-3">
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Text Size</Label>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger data-testid="select-font-size" className="h-14 text-lg rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-lg py-3">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-lg font-semibold">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger data-testid="select-theme" className="h-14 text-lg rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-lg py-3">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button
        data-testid="button-save-profile"
        size="lg"
        className="w-full h-16 text-xl rounded-2xl shadow-lg"
        onClick={handleSave}
        disabled={updateProfile.isPending}
      >
        <Save className="w-6 h-6 mr-3" />
        {updateProfile.isPending ? "Saving..." : "Save Changes"}
      </Button>

      <div className="h-4" />
    </div>
  );
}
