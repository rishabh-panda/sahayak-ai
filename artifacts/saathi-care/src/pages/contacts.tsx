import { useState } from "react";
import {
  useListContacts,
  useCreateContact,
  useDeleteContact,
  getListContactsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Users, Plus, Trash2, Phone, ShieldAlert, User,
  Heart, Briefcase, UserCheck, UserPlus, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const RELATIONSHIPS = [
  { value: "son", label: "Son", Icon: User },
  { value: "daughter", label: "Daughter", Icon: User },
  { value: "spouse", label: "Spouse", Icon: Heart },
  { value: "sibling", label: "Brother / Sister", Icon: Users },
  { value: "friend", label: "Friend", Icon: UserCheck },
  { value: "doctor", label: "Doctor", Icon: Briefcase },
  { value: "caregiver", label: "Caregiver", Icon: UserPlus },
  { value: "other", label: "Other", Icon: Star },
];

const getRel = (v: string) => RELATIONSHIPS.find((r) => r.value === v) ?? RELATIONSHIPS[7];

export default function Contacts() {
  const { data: contacts = [], isLoading } = useListContacts({ query: { queryKey: getListContactsQueryKey() } });
  const createContact = useCreateContact();
  const deleteContact = useDeleteContact();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("son");
  const [phone, setPhone] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });

  const handleCreate = () => {
    if (!name.trim() || !phone.trim()) return;
    createContact.mutate(
      { data: { name: name.trim(), relationship: relationship as "son", phone: phone.trim(), isEmergency } },
      {
        onSuccess: () => {
          toast({ title: "Contact added", description: `${name} added to your contacts.` });
          invalidate();
          setOpen(false);
          setName(""); setRelationship("son"); setPhone(""); setIsEmergency(false);
        },
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    deleteContact.mutate({ id }, {
      onSuccess: () => { toast({ title: "Contact removed", description: `${name} removed.` }); invalidate(); },
    });
  };

  const emergencyContacts = contacts.filter((c) => c.isEmergency);
  const otherContacts = contacts.filter((c) => !c.isEmergency);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-400">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">Family, friends &amp; emergency contacts</p>
        </div>
        <button
          data-icon-only
          data-testid="button-add-contact"
          onClick={() => setOpen(true)}
          className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25 hover:bg-primary/90 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="py-14 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Users className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-[17px] font-semibold text-foreground">No contacts yet</p>
            <p className="text-[14px] text-muted-foreground text-center">Add family, friends, and emergency contacts</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-2 h-11 px-6 rounded-xl bg-primary text-white font-semibold text-[14px] flex items-center gap-2 shadow-md shadow-primary/25 hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          {emergencyContacts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4.5 h-4.5 text-destructive" strokeWidth={2} />
                <h2 className="text-[14px] font-semibold text-destructive uppercase tracking-wide">Emergency</h2>
              </div>
              {emergencyContacts.map((c) => {
                const rel = getRel(c.relationship);
                const Icon = rel.Icon;
                return (
                  <Card key={c.id} data-testid={`card-contact-${c.id}`} className="border-destructive/20 bg-rose-50/40">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-destructive" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px] text-foreground truncate">{c.name}</p>
                        <p className="text-[13px] text-muted-foreground">{rel.label}</p>
                      </div>
                      <a
                        href={`tel:${c.phone}`}
                        data-testid={`button-call-${c.id}`}
                        className="w-11 h-11 rounded-xl bg-secondary text-white flex items-center justify-center shadow-sm hover:bg-secondary/90 transition-colors shrink-0"
                      >
                        <Phone className="w-5 h-5" strokeWidth={2} />
                      </a>
                      <button
                        data-icon-only
                        data-testid={`button-delete-contact-${c.id}`}
                        onClick={() => handleDelete(c.id, c.name)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {otherContacts.length > 0 && (
            <div className="space-y-2">
              {emergencyContacts.length > 0 && (
                <h2 className="text-[14px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Other Contacts</h2>
              )}
              {otherContacts.map((c) => {
                const rel = getRel(c.relationship);
                const Icon = rel.Icon;
                return (
                  <Card key={c.id} data-testid={`card-contact-${c.id}`} className="border-border/60 hover:border-primary/30 hover:shadow-sm transition-all">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[15px] text-foreground truncate">{c.name}</p>
                        <p className="text-[13px] text-muted-foreground">{rel.label}</p>
                      </div>
                      <a
                        href={`tel:${c.phone}`}
                        data-testid={`button-call-${c.id}`}
                        className="w-11 h-11 rounded-xl bg-accent text-accent-foreground flex items-center justify-center hover:bg-primary hover:text-white transition-colors shrink-0"
                      >
                        <Phone className="w-5 h-5" strokeWidth={2} />
                      </a>
                      <button
                        data-icon-only
                        data-testid={`button-delete-contact-${c.id}`}
                        onClick={() => handleDelete(c.id, c.name)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Name</Label>
              <Input data-testid="input-contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahul" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger data-testid="select-relationship" className="h-[52px] text-[15px] rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-[15px] py-2.5">{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold">Phone Number</Label>
              <Input data-testid="input-contact-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 9876543210" type="tel" className="h-[52px] text-[15px] rounded-xl" />
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-rose-50 rounded-xl border border-rose-200">
              <div>
                <p className="text-[14px] font-semibold text-foreground">Emergency Contact</p>
                <p className="text-[12px] text-muted-foreground">Pin to top for quick access</p>
              </div>
              <Switch data-testid="switch-emergency" checked={isEmergency} onCheckedChange={setIsEmergency} />
            </div>
            <Button data-testid="button-save-contact" size="lg" className="w-full h-[52px] text-[15px] font-semibold rounded-xl" onClick={handleCreate} disabled={!name.trim() || !phone.trim() || createContact.isPending}>
              {createContact.isPending ? "Saving..." : "Add Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
