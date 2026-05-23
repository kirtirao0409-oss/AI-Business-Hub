import { useState } from "react";
import {
  useGetCandidates,
  useGetCandidateStages,
  useCreateCandidate,
  getGetCandidatesQueryKey,
  getGetCandidateStagesQueryKey,
  CandidateInputStage,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter } from "lucide-react";

const STAGE_OPTIONS = Object.values(CandidateInputStage);

const defaultForm = {
  name: "",
  role: "",
  email: "",
  phone: "",
  stage: "applied" as keyof typeof CandidateInputStage,
  score: "",
  notes: "",
};

export default function HR() {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: candidates, isLoading: isCandidatesLoading } = useGetCandidates({ stage });
  const { data: stages, isLoading: isStagesLoading } = useGetCandidateStages();
  const { mutate: createCandidate, isPending } = useCreateCandidate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCandidateStagesQueryKey() });
        setOpen(false);
        setForm(defaultForm);
        setFormError(null);
      },
      onError: (err: Error) => {
        setFormError(err.message || "Failed to create candidate.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.role.trim() || !form.email.trim()) {
      setFormError("Name, role, and email are required.");
      return;
    }
    createCandidate({
      data: {
        name: form.name.trim(),
        role: form.role.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        stage: form.stage as typeof CandidateInputStage[keyof typeof CandidateInputStage],
        score: form.score ? parseInt(form.score, 10) : undefined,
        notes: form.notes.trim() || undefined,
      },
    });
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Recruitment</h1>
          <p className="text-muted-foreground">Manage candidates and open positions.</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => { setOpen(true); setFormError(null); setForm(defaultForm); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {isStagesLoading
          ? Array(7).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </CardContent>
              </Card>
            ))
          : stages?.map((s) => (
              <Card
                key={s.stage}
                className={`bg-card/50 border-card-border text-center cursor-pointer transition-colors ${
                  stage === s.stage ? "ring-2 ring-primary" : "hover:border-primary/50"
                }`}
                onClick={() => setStage(stage === s.stage ? undefined : s.stage)}
              >
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground capitalize mb-1">{s.stage}</div>
                  <div className="text-2xl font-bold">{s.count}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card className="bg-card/50 border-card-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Candidates</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isCandidatesLoading
                ? Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : candidates?.length
                ? candidates.map((candidate) => (
                    <TableRow key={candidate.id} className="border-border hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">{candidate.name}</TableCell>
                      <TableCell>{candidate.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{candidate.stage}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {candidate.score ? `${candidate.score}/100` : "-"}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(candidate.appliedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No candidates found.
                      </TableCell>
                    </TableRow>
                  )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cand-name">Full Name *</Label>
                <Input id="cand-name" placeholder="Alex Johnson" value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cand-role">Role Applied *</Label>
                <Input id="cand-role" placeholder="Senior Engineer" value={form.role} onChange={set("role")} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cand-email">Email *</Label>
              <Input id="cand-email" type="email" placeholder="alex@email.com" value={form.email} onChange={set("email")} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cand-phone">Phone</Label>
                <Input id="cand-phone" placeholder="+1 555 000 0000" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cand-score">Score (0–100)</Label>
                <Input id="cand-score" type="number" min="0" max="100" placeholder="85" value={form.score} onChange={set("score")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select
                value={form.stage}
                onValueChange={(v) => setForm((p) => ({ ...p, stage: v as typeof form.stage }))}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAGE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cand-notes">Notes</Label>
              <Input id="cand-notes" placeholder="Additional notes…" value={form.notes} onChange={set("notes")} />
            </div>
            {formError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Add Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
