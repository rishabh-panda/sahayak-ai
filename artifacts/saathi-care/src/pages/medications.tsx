import { useState } from "react";
import {
  useListMedications,
  useCreateMedication,
  useDeleteMedication,
  getListMedicationsQueryKey,
  getGetDashboardSummaryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Pill, Plus, Trash2, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function Medications() {
  const { data: medications = [], isLoading } = useListMedications({ query: { queryKey: getListMedicationsQueryKey() } });
  const createMedication = useCreateMedication();
  const deleteMedication = useDeleteMedication();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("Once daily");
  const [times, setTimes] = useState("08:00");
  const [instructions, setInstructions] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListMedicationsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const handleCreate = () => {
    if (!name.trim() || !dosage.trim()) return;
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
          toast({ title: "Medication Added!", description: `${name} has been added to your medications.` });
          invalidate();
          setOpen(false);
          setName("");
          setDosage("");
          setFrequency("Once daily");
          setTimes("08:00");
          setInstructions("");
          setPrescribedBy("");
        },
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    deleteMedication.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Medication Removed", description: `${name} has been removed.` });
          invalidate();
        },
      }
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medications</h1>
          <p className="text-lg text-muted-foreground mt-1">Your medicines</p>
        </div>
        <Button
          data-testid="button-add-medication"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {medications.length > 0 && (
        <Card className="bg-accent/10 border-accent/30">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertCircle className="w-6 h-6 text-accent-foreground mt-0.5 shrink-0" />
            <p className="text-base text-accent-foreground font-medium">
              You have {medications.filter((m) => m.isActive).length} active medication{medications.filter((m) => m.isActive).length !== 1 ? "s" : ""}. Always take them as prescribed by your doctor.
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : medications.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Pill className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-xl font-medium text-muted-foreground text-center">No medications yet</p>
            <p className="text-base text-muted-foreground text-center">Add your medicines here so you never miss a dose</p>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full mt-2" onClick={() => setOpen(true)}>
              <Plus className="w-5 h-5 mr-2" /> Add Medicine
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medications.map((m) => (
            <Card key={m.id} data-testid={`card-medication-${m.id}`} className="border-border/50 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-3xl">
                    💊
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-foreground">{m.name}</h3>
                      <button
                        data-testid={`button-delete-medication-${m.id}`}
                        onClick={() => handleDelete(m.id, m.name)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-lg text-muted-foreground mt-1">
                      {m.dosage} — {m.frequency}
                    </p>
                    {m.times && m.times.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {m.times.map((t, i) => (
                          <Badge key={i} variant="secondary" className="text-sm px-2 py-0.5">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {m.instructions && (
                      <p className="text-base text-muted-foreground mt-2 italic">{m.instructions}</p>
                    )}
                    {m.prescribedBy && (
                      <p className="text-sm text-muted-foreground mt-1">Dr. {m.prescribedBy}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Medicine Name</Label>
              <Input
                data-testid="input-medication-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Metformin"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Dosage</Label>
              <Input
                data-testid="input-medication-dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 500mg"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">How Often?</Label>
              <Input
                data-testid="input-medication-frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Twice daily"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Time(s) (comma separated)</Label>
              <Input
                data-testid="input-medication-times"
                value={times}
                onChange={(e) => setTimes(e.target.value)}
                placeholder="e.g. 08:00, 20:00"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Instructions (optional)</Label>
              <Input
                data-testid="input-medication-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Take after food"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Prescribed By (optional)</Label>
              <Input
                data-testid="input-medication-prescribedby"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="e.g. Dr. Sharma"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <Button
              data-testid="button-save-medication"
              size="lg"
              className="w-full h-14 text-xl rounded-xl"
              onClick={handleCreate}
              disabled={!name.trim() || !dosage.trim() || createMedication.isPending}
            >
              {createMedication.isPending ? "Saving..." : "Add Medicine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
