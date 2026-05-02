import { useState } from "react";
import {
  useListHealthRecords,
  useCreateHealthRecord,
  useGetHealthSummary,
  getListHealthRecordsQueryKey,
  getGetHealthSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Plus, Heart, Droplets, Weight, Thermometer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", Icon: Heart, unit: "mmHg", placeholder: "e.g. 120/80", color: "text-rose-500 bg-rose-50" },
  { value: "blood_sugar", label: "Blood Sugar", Icon: Droplets, unit: "mg/dL", placeholder: "e.g. 100", color: "text-amber-500 bg-amber-50" },
  { value: "weight", label: "Weight", Icon: Weight, unit: "kg", placeholder: "e.g. 70", color: "text-blue-500 bg-blue-50" },
  { value: "heart_rate", label: "Heart Rate", Icon: Activity, unit: "bpm", placeholder: "e.g. 72", color: "text-primary bg-primary/10" },
  { value: "temperature", label: "Temperature", Icon: Thermometer, unit: "°F", placeholder: "e.g. 98.6", color: "text-orange-500 bg-orange-50" },
];

const getVital = (t: string) => VITAL_TYPES.find((v) => v.value === t) ?? VITAL_TYPES[0];

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

  const selectedVital = getVital(type);

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
          toast({ title: "Reading saved", description: `${selectedVital?.label}: ${value} ${selectedVital?.unit}` });
          invalidate();
          setOpen(false);
          setValue(""); setNotes("");
        },
      }
    );
  };

  const formatDate = (d: string | Date) => {
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const summaryKeys = [
    { key: "latestBloodPressure", vital: getVital("blood_pressure") },
    { key: "latestBloodSugar", vital: getVital("blood_sugar") },
    { key: "latestWeight", vital: getVital("weight") },
    { key: "latestHeartRate", vital: getVital("heart_rate") },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Health Tracker</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Log and monitor your vitals</p>
        </div>
        <button
          data-icon-only
          data-testid="button-add-health-record"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {summaryKeys.map(({ key, vital }) => {
            const record = summary
              ? (summary as Record<string, { value: string; recordedAt: Date } | null>)[key]
              : null;
            const Icon = vital.Icon;
            return (
              <Card key={key} className="border-border/60">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${vital.color}`}>
                    <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                  </div>
                  {record ? (
                    <>
                      <p className="text-xl font-bold text-foreground">{record.value}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{vital.unit} &middot; {formatDate(record.recordedAt)}</p>
                    </>
                  ) : (
                    <p className="text-[14px] text-muted-foreground font-medium">—</p>
                  )}
                  <p className="text-[12px] text-muted-foreground mt-1 font-medium">{vital.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Weekly count */}
      {summary && summary.weeklyRecordCount > 0 && (
        <Card className="border-secondary/25 bg-secondary/5">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4.5 h-4.5 text-secondary" strokeWidth={2} />
            </div>
            <p className="text-[14px] font-semibold text-foreground">
              {summary.weeklyRecordCount} reading{summary.weeklyRecordCount !== 1 ? "s" : ""} logged this week — well done!
            </p>
          </CardContent>
        </Card>
      )}

      {/* History */}
      <div>
        <h2 className="text-[16px] font-semibold text-foreground mb-3">Recent Readings</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
          </div>
        ) : records.length === 0 ? (
          <Card className="border-dashed border-2 border-border">
            <CardContent className="py-12 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Activity className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-[17px] font-semibold text-foreground">No readings yet</p>
              <button
                onClick={() => setOpen(true)}
                className="mt-1 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-[14px] flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
              >
                <Plus className="w-4 h-4" /> Log a Reading
              </button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {records.map((r) => {
              const v = getVital(r.type);
              const Icon = v.Icon;
              return (
                <Card key={r.id} data-testid={`card-health-record-${r.id}`} className="border-border/50">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${v.color}`}>
                      <Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-[15px] text-foreground">{v.label}</p>
                        <span className="font-bold text-[15px] text-foreground">
                          {r.value} <span className="text-[12px] font-normal text-muted-foreground">{v.unit}</span>
                        </span>
                      </div>
                      {r.notes && <p className="text-[12px] text-muted-foreground mt-0.5 italic truncate">{r.notes}</p>}
                      <p className="text-[12px] text-muted-foreground mt-0.5">{formatDate(r.recordedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Log Health Reading</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">Measurement Type</Label>
              <Select value={type} onValueChange={(v) => { setType(v); setValue(""); }}>
                <SelectTrigger data-testid="select-health-type" className="h-[52px] text-[15px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VITAL_TYPES.map((vt) => (
                    <SelectItem key={vt.value} value={vt.value} className="text-[15px] py-2.5">
                      {vt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">
                Value ({selectedVital?.unit})
              </Label>
              <Input
                data-testid="input-health-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={selectedVital?.placeholder}
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-foreground">Notes (optional)</Label>
              <Input
                data-testid="input-health-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Measured after breakfast"
                className="h-[52px] text-[15px] rounded-xl"
              />
            </div>
            <Button
              data-testid="button-save-health-record"
              size="lg"
              className="w-full h-[52px] text-[15px] font-semibold rounded-xl"
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
