import { useState } from "react";
import {
  useListContacts,
  useCreateContact,
  useDeleteContact,
  getListContactsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const RELATIONSHIPS = [
  { value: "son", label: "Son" },
  { value: "daughter", label: "Daughter" },
  { value: "spouse", label: "Spouse" },
  { value: "sibling", label: "Brother / Sister" },
  { value: "friend", label: "Friend" },
  { value: "doctor", label: "Doctor" },
  { value: "caregiver", label: "Caregiver" },
  { value: "other", label: "Other" },
];

const relLabel = (r: string) => RELATIONSHIPS.find((x) => x.value === r)?.label ?? r;

const relEmoji = (r: string) => {
  const map: Record<string, string> = {
    son: "👦", daughter: "👧", spouse: "💑", sibling: "🧑", friend: "😊", doctor: "👨‍⚕️", caregiver: "🤝", other: "👤",
  };
  return map[r] ?? "👤";
};

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
  };

  const handleCreate = () => {
    if (!name.trim() || !phone.trim()) return;
    createContact.mutate(
      { data: { name: name.trim(), relationship: relationship as "son", phone: phone.trim(), isEmergency } },
      {
        onSuccess: () => {
          toast({ title: "Contact Added!", description: `${name} has been added to your contacts.` });
          invalidate();
          setOpen(false);
          setName("");
          setRelationship("son");
          setPhone("");
          setIsEmergency(false);
        },
      }
    );
  };

  const handleDelete = (id: number, name: string) => {
    deleteContact.mutate(
      { id },
      {
        onSuccess: () => {
          toast({ title: "Contact Removed", description: `${name} has been removed.` });
          invalidate();
        },
      }
    );
  };

  const emergencyContacts = contacts.filter((c) => c.isEmergency);
  const otherContacts = contacts.filter((c) => !c.isEmergency);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Family & Friends</h1>
          <p className="text-lg text-muted-foreground mt-1">Your important contacts</p>
        </div>
        <Button
          data-testid="button-add-contact"
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      ) : contacts.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center gap-4">
            <Users className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-xl font-medium text-muted-foreground text-center">No contacts yet</p>
            <p className="text-base text-muted-foreground text-center">Add family and emergency contacts here</p>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full mt-2" onClick={() => setOpen(true)}>
              <Plus className="w-5 h-5 mr-2" /> Add Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {emergencyContacts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
                <Star className="w-5 h-5" /> Emergency Contacts
              </h2>
              {emergencyContacts.map((c) => (
                <Card key={c.id} data-testid={`card-contact-${c.id}`} className="border-destructive/20 bg-destructive/5 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-3xl shrink-0">
                      {relEmoji(c.relationship)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground">{c.name}</h3>
                      <p className="text-base text-muted-foreground">{relLabel(c.relationship)}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      data-testid={`button-call-${c.id}`}
                      className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-md hover:bg-accent/80 transition-colors shrink-0"
                    >
                      <Phone className="w-7 h-7" />
                    </a>
                    <button
                      data-testid={`button-delete-contact-${c.id}`}
                      onClick={() => handleDelete(c.id, c.name)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {otherContacts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-foreground">Other Contacts</h2>
              {otherContacts.map((c) => (
                <Card key={c.id} data-testid={`card-contact-${c.id}`} className="border-border/50 shadow-sm">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-3xl shrink-0">
                      {relEmoji(c.relationship)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-foreground">{c.name}</h3>
                      <p className="text-base text-muted-foreground">{relLabel(c.relationship)}</p>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      data-testid={`button-call-${c.id}`}
                      className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm hover:bg-primary/20 transition-colors shrink-0"
                    >
                      <Phone className="w-7 h-7" />
                    </a>
                    <button
                      data-testid={`button-delete-contact-${c.id}`}
                      onClick={() => handleDelete(c.id, c.name)}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Name</Label>
              <Input
                data-testid="input-contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Relationship</Label>
              <Select value={relationship} onValueChange={setRelationship}>
                <SelectTrigger data-testid="select-relationship" className="h-14 text-lg rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-lg py-3">
                      {relEmoji(r.value)} {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Phone Number</Label>
              <Input
                data-testid="input-contact-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                type="tel"
                className="h-14 text-lg rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-destructive/5 rounded-xl border border-destructive/20">
              <div>
                <Label className="text-lg font-semibold">Emergency Contact</Label>
                <p className="text-sm text-muted-foreground">Show at the top for quick access</p>
              </div>
              <Switch
                data-testid="switch-emergency"
                checked={isEmergency}
                onCheckedChange={setIsEmergency}
                className="scale-125"
              />
            </div>
            <Button
              data-testid="button-save-contact"
              size="lg"
              className="w-full h-14 text-xl rounded-xl"
              onClick={handleCreate}
              disabled={!name.trim() || !phone.trim() || createContact.isPending}
            >
              {createContact.isPending ? "Saving..." : "Add Contact"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
