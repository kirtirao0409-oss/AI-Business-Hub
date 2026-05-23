import { useState } from "react";
import { 
  useGetCandidates, 
  useGetCandidateStages,
  getGetCandidatesQueryKey,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter } from "lucide-react";

export default function HR() {
  const [stage, setStage] = useState<string | undefined>();
  const { data: candidates, isLoading: isCandidatesLoading } = useGetCandidates({ stage });
  const { data: stages, isLoading: isStagesLoading } = useGetCandidateStages();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">HR Recruitment</h1>
          <p className="text-muted-foreground">Manage candidates and open positions.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {isStagesLoading ? (
          Array(7).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </CardContent>
            </Card>
          ))
        ) : (
          stages?.map((s) => (
            <Card 
              key={s.stage} 
              className={`bg-card/50 border-card-border text-center cursor-pointer transition-colors ${stage === s.stage ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => setStage(stage === s.stage ? undefined : s.stage)}
            >
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground capitalize mb-1">{s.stage}</div>
                <div className="text-2xl font-bold">{s.count}</div>
              </CardContent>
            </Card>
          ))
        )}
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
              {isCandidatesLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-border">
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : candidates?.length ? (
                candidates.map((candidate) => (
                  <TableRow key={candidate.id} className="border-border hover:bg-muted/50 cursor-pointer">
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell>{candidate.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {candidate.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{candidate.score ? `${candidate.score}/100` : '-'}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(candidate.appliedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
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
    </div>
  );
}
