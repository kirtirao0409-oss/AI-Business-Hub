import { useState } from "react";
import { 
  useGetLeads, 
  useGetLeadPipeline,
  getGetLeadsQueryKey,
  getGetLeadPipelineQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";

export default function CRM() {
  const [search, setSearch] = useState("");
  const { data: leads, isLoading: isLeadsLoading } = useGetLeads({ search });
  const { data: pipeline, isLoading: isPipelineLoading } = useGetLeadPipeline();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
      case 'contacted': return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'qualified': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20';
      case 'proposal': return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20';
      case 'negotiation': return 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20';
      case 'won': return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'lost': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default: return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Pipeline</h1>
          <p className="text-muted-foreground">Manage leads and opportunities.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {isPipelineLoading ? (
          Array(7).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </CardContent>
            </Card>
          ))
        ) : (
          pipeline?.map((stage) => (
            <Card key={stage.stage} className="bg-card/50 border-card-border text-center">
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground capitalize mb-1">{stage.stage}</div>
                <div className="text-2xl font-bold">{stage.count}</div>
                <div className="text-xs text-muted-foreground mt-1">${stage.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))
        )}
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
              {isLeadsLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads?.length ? (
                leads.map((lead) => (
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
              ) : (
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
    </div>
  );
}
