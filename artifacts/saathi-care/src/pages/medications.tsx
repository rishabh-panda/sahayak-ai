import { useState } from "react";
import {
  useListMedications,
  useCreateMedication,
  useDeleteMedication,
  getListMedicationsQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, Trash2, Clock, AlertTriangle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

/** Convert "08:00" → "8:00 AM", "20:00" → "8:00 PM" */
function fmt12h(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr, 10);
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr ?? "00"} ${period}`;
}

export default function Medications() {
  const { data: medications = [], isLoading } = useListMedications({ query: { queryKey: getListMedicationsQueryKey() } });
  const createMedication = useCreateMedication();
  const deleteMedication = useDeleteMedication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [times, setTimes] = useState("08:00");
  const [instructions, setInstructions] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [nameError, setNameError] = useState(false);
  const [dosageError, setDosageError] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const handleCreate = () => {
    let valid = true;
    if (!name.trim()) { setNameError(true); valid = false; }
    if (!dosage.trim()) { setDosageError(true); valid = false; }
    if (!valid) return;

    createMedication.mutate(
      {
        data: {
          name: name.trim(),
          dosage: dosage.trim(),
          frequency,
          times: times.split(",").map((t) => t.trim()).filter(Boolean),
          instructions: instructions.trim() || undefined,
          prescribedBy: prescribedBy.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Medicine added", description: `${name.trim()} added to your list.` });
          invalidate();
          setOpen(false);
          setName(""); setDosage(""); setFrequency("Once daily");
          setTimes("08:00"); setInstructions(""); setPrescribedBy("");
          setNameError(false); setDosageError(false);
        },
        onError: () => toast({ title: "Could not add medicine", variant: "destructive" }),
      }
    );
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteMedication.mutate({ id: deleteTarget.id }, {
      onSuccess: () => {
        toast({ title: "Medicine removed", description: `${deleteTarget.name} removed.` });
        invalidate();
        setDeleteTarget(null);
      },
    });
  };

  const activeMeds = medications.filter((m) => m.isActive);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Medicines</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Track your medications</p>
        </div>
        <button
          data-icon-only
          data-testid="button-add-medication"
          aria-label="Add new medicine"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {activeMeds.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            <p className="text-[14px] text-amber-900 font-medium">
              You have {activeMeds.length} active medicine{activeMeds.length !== 1 ? "s" : ""}. Always take them exactly as prescribed by your doctor.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : medications.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Pill className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-semibold text-foreground">No medicines added</p>
            <p className="text-[14px] text-muted-foreground text-center">Add your medicines to never miss a dose</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-2 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-[14px] flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Medicine
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medications.map((m) => (
            <Card key={m.id} data-testid={`card-medication-${m.id}`} className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-primary" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[16px] text-foreground">{m.name}</p>
                      <button
                        data-icon-only
                        data-testid={`button-delete-medication-${m.id}`}
                        aria-label={`Delete medicine ${m.name}`}
                        onClick={() => setDeleteTarget({ id: m.id, name: m.name })}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                    <p className="text-[14px] text-muted-foreground mt-0.5 font-medium">
                      {m.dosage} &middot; {m.frequency}
                    </p>
                    {m.times && m.times.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                        {m.times.map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-[11px] px-2 py-0 h-5 font-semibold">
                            {fmt12h(t)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {m.instructions && (
                      <p className="text-[13px] text-muted-foreground mt-1.5 italic">{m.instructions}</p>
                    )}
                    {m.prescribedBy && (
                      <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1">
                        <User className="w-3 h-3" aria-hidden="true" /> Dr. {m.prescribedBy}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Medicine Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setNameError(false); setDosageError(false); } }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Medicine Name *</Label>
              <Input data-testid="input-medication-name" value={name} onChange={(e) => { setName(e.target.value); setNameError(false); }} placeholder="e.g. Metformin" className={`h-[52px] text-[15px] rounded-xl ${nameError ? "border-destructive" : ""}`} aria-invalid={nameError} />
              {nameError && <p className="text-[12px] text-destructive font-medium">Medicine name is required</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Dosage *</Label>
              <Input data-testid="input-medication-dosage" value={dosage} onChange={(e) => { setDosage(e.target.value); setDosageError(false); }} placeholder="e.g. 500mg" className={`h-[52px] text-[15px] rounded-xl ${dosageError ? "border-destructive" : ""}`} aria-invalid={dosageError} />
              {dosageError && <p className="text-[12px] text-destructive font-medium">Dosage is required</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Frequency</Label>
              <Input data-testid="input-medication-frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g. Twice daily" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Time(s) — comma separated</Label>
              <Input data-testid="input-medication-times" value={times} onChange={(e) => setTimes(e.target.value)} placeholder="e.g. 08:00, 20:00" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Instructions (optional)</Label>
              <Input data-testid="input-medication-instructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Take after food" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Prescribed By (optional)</Label>
              <Input data-testid="input-medication-prescribedby" value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} placeholder="e.g. Dr. Sharma" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <Button data-testid="button-save-medication" size="lg" className="w-full h-[52px] text-[15px] font-semibold rounded-xl" onClick={handleCreate} disabled={createMedication.isPending}>
              {createMedication.isPending ? "Saving..." : "Add Medicine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Medicine?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{deleteTarget?.name}</strong> from your list? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="rounded-xl bg-destructive text-white hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
