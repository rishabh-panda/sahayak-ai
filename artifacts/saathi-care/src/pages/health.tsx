import { useState } from "react";
import {
  useListHealthRecords,
  useCreateHealthRecord,
  useGetHealthSummary,
  getListHealthRecordsQueryKey,
  getGetHealthSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Heart, Droplets, Weight, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", icon: "❤️", unit: "mmHg", placeholder: "e.g. 120/80" },
  { value: "blood_sugar", label: "Blood Sugar", icon: "🩸", unit: "mg/dL", placeholder: "e.g. 100" },
  { value: "weight", label: "Weight", icon: "⚖️", unit: "kg", placeholder: "e.g. 70" },
  { value: "heart_rate", label: "Heart Rate", icon: "💗", unit: "bpm", placeholder: "e.g. 72" },
  { value: "temperature", label: "Temperature", icon: "🌡️", unit: "°F", placeholder: "e.g. 98.6" },
];

const vitalIcon = (t: string) => VITAL_TYPES.find((v) => v.value === t)?.icon ?? "📊";
const vitalLabel = (t: string) => VITAL_TYPES.find((v) => v.value === t)?.label ?? t;
const vitalUnit = (t: string) => VITAL_TYPES.find((v) => v.value === t)?.unit ?? "";

export default function Health() {
  const { data: records = [], isLoading } = useListHealthRecords(
    { limit: 15 },
    { query: { queryKey: getListHealthRecordsQueryKey({ limit: 15 }) } }
  );
  const { data: summary, isLoading: summaryLoading } = useGetHealthSummary({
    query: { queryKey: getGetHealthSummaryQueryKey() },
  });
  const createRecord = useCreateHealthRecord();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [type, setType] = useState("blood_pressure");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const selectedVital = VITAL_TYPES.find((v) => v.value === type);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListHealthRecordsQueryKey({ limit: 15 }) });
    queryClient.invalidateQueries({ queryKey: getGetHealthSummaryQueryKey() });
  };

  const handleCreate = () => {
    if (!value.trim()) return;
    createRecord.mutate(
      {
        data: {
          type: type as "blood_pressure",
          value: value.trim(),
          unit: selectedVital?.unit ?? "",
          notes: notes.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Health Reading Saved!", description: `${selectedVital?.label}: ${value} ${selectedVital?.unit}` });
          invalidate();
          setOpen(false);
          setValue("");
          setNotes("");
        },
      }
    );
  };

  const summaryCards = [
    { key: "latestBloodPressure", label: "Blood Pressure", icon: "❤️", unit: "mmHg" },
    { key: "latestBloodSugar", label: "Blood Sugar", icon: "🩸", unit: "mg/dL" },
    { key: "latestWeight", label: "Weight", icon: "⚖️", unit: "kg" },
    { key: "latestHeartRate", label: "Heart Rate", icon: "💗", unit: "bpm" },
  ];

  const formatDate = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Health Tracker</h1>
          <p className="text-lg text-muted-foreground mt-1">Log your vitals</p>
        </div>
        <Button
          data-testid="button-add-health-record"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map(({ key, label, icon, unit }) => {
            const record = summary ? (summary as Record<string, { value: string; recordedAt: Date } | null>)[key] : null;
            return (
              <Card key={key} className="border-border/50 shadow-sm">
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm font-medium text-muted-foreground">{label}</span>
                  </div>
                  {record ? (
                    <>
                      <p className="text-2xl font-bold text-foreground">{record.value}</p>
                      <p className="text-xs text-muted-foreground">{unit} · {formatDate(record.recordedAt)}</p>
                    </>
                  ) : (
                    <p className="text-base text-muted-foreground">Not logged yet</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly count */}
      {summary && (
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="p-4">
            <p className="text-lg font-semibold text-accent-foreground">
              You logged {summary.weeklyRecordCount} health reading{summary.weeklyRecordCount !== 1 ? "s" : ""} this week. Keep it up!
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Recent Readings</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : records.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <Activity className="w-16 h-16 text-muted-foreground/40" />
              <p className="text-xl font-medium text-muted-foreground">No readings yet</p>
              <Button size="lg" className="h-14 px-8 text-lg rounded-full mt-2" onClick={() => setOpen(true)}>
                <Plus className="w-5 h-5 mr-2" /> Log a Reading
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {records.map((r) => (
              <Card key={r.id} data-testid={`card-health-record-${r.id}`} className="border-border/40 shadow-sm">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="text-3xl">{vitalIcon(r.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-foreground">{vitalLabel(r.type)}</p>
                      <p className="text-base font-bold text-foreground">{r.value} <span className="text-sm font-normal text-muted-foreground">{vitalUnit(r.type)}</span></p>
                    </div>
                    {r.notes && <p className="text-sm text-muted-foreground mt-0.5 italic">{r.notes}</p>}
                    <p className="text-sm text-muted-foreground mt-0.5">{formatDate(r.recordedAt)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Log Health Reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">What are you measuring?</Label>
              <Select value={type} onValueChange={(v) => { setType(v); setValue(""); }}>
                <SelectTrigger data-testid="select-health-type" className="h-14 text-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VITAL_TYPES.map((vt) => (
                    <SelectItem key={vt.value} value={vt.value} className="text-lg py-3">
                      {vt.icon} {vt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">
                Value ({selectedVital?.unit})
              </Label>
              <Input
                data-testid="input-health-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={selectedVital?.placeholder}
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Notes (optional)</Label>
              <Input
                data-testid="input-health-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Measured after breakfast"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <Button
              data-testid="button-save-health-record"
              size="lg"
              className="w-full h-14 text-xl rounded-xl"
              onClick={handleCreate}
              disabled={!value.trim() || createRecord.isPending}
            >
              {createRecord.isPending ? "Saving..." : "Save Reading"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
