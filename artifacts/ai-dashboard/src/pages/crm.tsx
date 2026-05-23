import { useState } from "react";
import {
  useGetLeads,
  useGetLeadPipeline,
  useCreateLead,
  getGetLeadsQueryKey,
  getGetLeadPipelineQueryKey,
  LeadInputStatus,
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
import { Search, Plus, Filter } from "lucide-react";

const STATUS_OPTIONS = Object.values(LeadInputStatus);

const defaultForm = {
  name: "",
  company: "",
  email: "",
  phone: "",
  status: "new" as keyof typeof LeadInputStatus,
  value: "",
  source: "",
};

export default function CRM() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: leads, isLoading: isLeadsLoading } = useGetLeads({ search });
  const { data: pipeline, isLoading: isPipelineLoading } = useGetLeadPipeline();
  const { mutate: createLead, isPending } = useCreateLead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetLeadsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLeadPipelineQueryKey() });
        setOpen(false);
        setForm(defaultForm);
        setFormError(null);
      },
      onError: (err: Error) => {
        setFormError(err.message || "Failed to create lead.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim() || !form.company.trim() || !form.email.trim()) {
      setFormError("Name, company, and email are required.");
      return;
    }
    createLead({
      data: {
        name: form.name.trim(),
        company: form.company.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        status: form.status as typeof LeadInputStatus[keyof typeof LeadInputStatus],
        value: parseFloat(form.value) || 0,
        source: form.source.trim() || undefined,
      },
    });
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "contacted": return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20";
      case "qualified": return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      case "proposal": return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "negotiation": return "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20";
      case "won": return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "lost": return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Pipeline</h1>
          <p className="text-muted-foreground">Manage leads and opportunities.</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => { setOpen(true); setFormError(null); setForm(defaultForm); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {isPipelineLoading
          ? Array(7).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </CardContent>
              </Card>
            ))
          : pipeline?.map((stage) => (
              <Card key={stage.stage} className="bg-card/50 border-card-border text-center">
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground capitalize mb-1">{stage.stage}</div>
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <div className="text-xs text-muted-foreground mt-1">${stage.value.toLocaleString()}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <Card className="bg-card/50 border-card-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Leads</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search leads..."
                className="pl-8 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
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
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLeadsLoading
                ? Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : leads?.length
                ? leads.map((lead) => (
                    <TableRow key={lead.id} className="border-border hover:bg-muted/50 cursor-pointer">
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(lead.status)} border-none capitalize`}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">${lead.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No leads found.
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
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lead-name">Name *</Label>
                <Input id="lead-name" placeholder="Jane Smith" value={form.name} onChange={set("name")} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-company">Company *</Label>
                <Input id="lead-company" placeholder="Acme Corp" value={form.company} onChange={set("company")} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">Email *</Label>
              <Input id="lead-email" type="email" placeholder="jane@acme.com" value={form.email} onChange={set("email")} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lead-phone">Phone</Label>
                <Input id="lead-phone" placeholder="+1 555 000 0000" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-value">Deal Value ($)</Label>
                <Input id="lead-value" type="number" min="0" placeholder="5000" value={form.value} onChange={set("value")} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((p) => ({ ...p, status: v as typeof form.status }))}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lead-source">Source</Label>
                <Input id="lead-source" placeholder="LinkedIn, Referral…" value={form.source} onChange={set("source")} />
              </div>
            </div>
            {formError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{formError}</p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Add Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
