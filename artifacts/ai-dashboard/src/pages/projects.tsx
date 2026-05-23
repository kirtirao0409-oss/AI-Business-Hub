import { useState } from "react";
import { 
  useGetProjects, 
  useGetProjectStats,
  useGetTasks,
  getGetProjectsQueryKey,
  getGetTasksQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Projects() {
  const { data: stats, isLoading: isStatsLoading } = useGetProjectStats();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const { data: tasks, isLoading: isTasksLoading } = useGetTasks({ projectId: selectedProjectId });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Track projects and active tasks.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isStatsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/50">
              <CardContent className="p-4 flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-8" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <StatCard title="Total Projects" value={stats.total} />
            <StatCard title="Active" value={stats.active} color="text-green-500" />
            <StatCard title="Completed" value={stats.completed} color="text-blue-500" />
            <StatCard title="On Hold" value={stats.onHold} color="text-yellow-500" />
          </>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          {isProjectsLoading ? (
            Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          ) : projects?.map((project) => (
            <Card 
              key={project.id} 
              className={`bg-card/50 cursor-pointer transition-colors ${selectedProjectId === project.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
              onClick={() => setSelectedProjectId(project.id)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{project.name}</h3>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-card/50 h-full border-card-border flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Tasks {selectedProjectId ? `for Project #${selectedProjectId}` : '(All Projects)'}</CardTitle>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent className="flex-1">
              {isTasksLoading ? (
                <div className="space-y-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : tasks?.length ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border border-primary/50" />
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">{task.status} • Priority: {task.priority}</p>
                        </div>
                      </div>
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                  No tasks found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "text-foreground" }: { title: string, value: number, color?: string }) {
  return (
    <Card className="bg-card/50 border-card-border text-center">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
