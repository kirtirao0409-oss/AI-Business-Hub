import { useState } from "react";
import {
  useGetProjects,
  useGetProjectStats,
  useGetTasks,
  useCreateProject,
  useCreateTask,
  getGetProjectsQueryKey,
  getGetProjectStatsQueryKey,
  getGetTasksQueryKey,
  ProjectInputStatus,
  ProjectInputPriority,
  TaskInputStatus,
  TaskInputPriority,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const defaultProjectForm = {
  name: "",
  description: "",
  status: "planning" as keyof typeof ProjectInputStatus,
  priority: "medium" as keyof typeof ProjectInputPriority,
  dueDate: "",
};

const defaultTaskForm = {
  title: "",
  description: "",
  status: "todo" as keyof typeof TaskInputStatus,
  priority: "medium" as keyof typeof TaskInputPriority,
  assignee: "",
  dueDate: "",
};

export default function Projects() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: isStatsLoading } = useGetProjectStats();
  const { data: projects, isLoading: isProjectsLoading } = useGetProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>();
  const { data: tasks, isLoading: isTasksLoading } = useGetTasks({ projectId: selectedProjectId });

  const [projectOpen, setProjectOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(defaultProjectForm);
  const [taskForm, setTaskForm] = useState(defaultTaskForm);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const { mutate: createProject, isPending: isCreatingProject } = useCreateProject({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetProjectStatsQueryKey() });
        setProjectOpen(false);
        setProjectForm(defaultProjectForm);
        setProjectError(null);
      },
      onError: (err: Error) => setProjectError(err.message || "Failed to create project."),
    },
  });

  const { mutate: createTask, isPending: isCreatingTask } = useCreateTask({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey({ projectId: selectedProjectId }) });
        queryClient.invalidateQueries({ queryKey: getGetTasksQueryKey() });
        setTaskOpen(false);
        setTaskForm(defaultTaskForm);
        setTaskError(null);
      },
      onError: (err: Error) => setTaskError(err.message || "Failed to create task."),
    },
  });

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProjectError(null);
    if (!projectForm.name.trim()) { setProjectError("Project name is required."); return; }
    if (!projectForm.dueDate) { setProjectError("Due date is required."); return; }
    createProject({
      data: {
        name: projectForm.name.trim(),
        description: projectForm.description.trim() || undefined,
        status: projectForm.status as typeof ProjectInputStatus[keyof typeof ProjectInputStatus],
        priority: projectForm.priority as typeof ProjectInputPriority[keyof typeof ProjectInputPriority],
        dueDate: projectForm.dueDate,
      },
    });
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTaskError(null);
    if (!taskForm.title.trim()) { setTaskError("Task title is required."); return; }
    const projectId = selectedProjectId ?? projects?.[0]?.id;
    if (!projectId) { setTaskError("Select a project first."); return; }
    createTask({
      data: {
        title: taskForm.title.trim(),
        description: taskForm.description.trim() || undefined,
        status: taskForm.status as typeof TaskInputStatus[keyof typeof TaskInputStatus],
        priority: taskForm.priority as typeof TaskInputPriority[keyof typeof TaskInputPriority],
        projectId,
        assignee: taskForm.assignee.trim() || undefined,
        dueDate: taskForm.dueDate || undefined,
      },
    });
  };

  const setProj = (key: keyof typeof projectForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProjectForm((p) => ({ ...p, [key]: e.target.value }));

  const setTask = (key: keyof typeof taskForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setTaskForm((p) => ({ ...p, [key]: e.target.value }));

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Track projects and active tasks.</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => { setProjectOpen(true); setProjectError(null); setProjectForm(defaultProjectForm); }}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isStatsLoading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i} className="bg-card/50">
                <CardContent className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-8" />
                </CardContent>
              </Card>
            ))
          : stats && (
              <>
                <StatCard title="Total Projects" value={stats.total} />
                <StatCard title="Active" value={stats.active} color="text-green-500" />
                <StatCard title="Completed" value={stats.completed} color="text-blue-500" />
                <StatCard title="On Hold" value={stats.onHold} color="text-yellow-500" />
              </>
            )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          {isProjectsLoading
            ? Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
            : projects?.map((project) => (
                <Card
                  key={project.id}
                  className={`bg-card/50 cursor-pointer transition-colors ${
                    selectedProjectId === project.id ? "ring-2 ring-primary" : "hover:border-primary/50"
                  }`}
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
              <CardTitle>
                Tasks{selectedProject ? ` — ${selectedProject.name}` : " (All Projects)"}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTaskOpen(true);
                  setTaskError(null);
                  setTaskForm(defaultTaskForm);
                }}
              >
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
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded border border-primary/50 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                            {task.status} · Priority: {task.priority}
                          </p>
                        </div>
                      </div>
                      {task.assignee && (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary font-bold shrink-0">
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

      {/* New Project Modal */}
      <Dialog open={projectOpen} onOpenChange={setProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProjectSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project Name *</Label>
              <Input id="proj-name" placeholder="Q3 Platform Relaunch" value={projectForm.name} onChange={setProj("name")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-desc">Description</Label>
              <Input id="proj-desc" placeholder="Brief project summary…" value={projectForm.description} onChange={setProj("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={projectForm.status}
                  onValueChange={(v) => setProjectForm((p) => ({ ...p, status: v as typeof projectForm.status }))}
                >
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectInputStatus).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={projectForm.priority}
                  onValueChange={(v) => setProjectForm((p) => ({ ...p, priority: v as typeof projectForm.priority }))}
                >
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(ProjectInputPriority).map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-due">Due Date *</Label>
              <Input id="proj-due" type="date" value={projectForm.dueDate} onChange={setProj("dueDate")} required />
            </div>
            {projectError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{projectError}</p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setProjectOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreatingProject}>
                {isCreatingProject ? "Saving…" : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Modal */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Add Task{selectedProject ? ` to ${selectedProject.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4 pt-2">
            {!selectedProjectId && projects?.length && (
              <div className="space-y-1.5">
                <Label>Project *</Label>
                <Select
                  value={String(selectedProjectId ?? "")}
                  onValueChange={(v) => setSelectedProjectId(Number(v))}
                >
                  <SelectTrigger className="bg-background"><SelectValue placeholder="Select a project" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="task-title">Title *</Label>
              <Input id="task-title" placeholder="Set up CI pipeline" value={taskForm.title} onChange={setTask("title")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="task-desc">Description</Label>
              <Input id="task-desc" placeholder="What needs to be done…" value={taskForm.description} onChange={setTask("description")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={taskForm.status}
                  onValueChange={(v) => setTaskForm((p) => ({ ...p, status: v as typeof taskForm.status }))}
                >
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskInputStatus).map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm((p) => ({ ...p, priority: v as typeof taskForm.priority }))}
                >
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.values(TaskInputPriority).map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="task-assignee">Assignee</Label>
                <Input id="task-assignee" placeholder="Name or initials" value={taskForm.assignee} onChange={setTask("assignee")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="task-due">Due Date</Label>
                <Input id="task-due" type="date" value={taskForm.dueDate} onChange={setTask("dueDate")} />
              </div>
            </div>
            {taskError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{taskError}</p>
            )}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isCreatingTask}>
                {isCreatingTask ? "Saving…" : "Add Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ title, value, color = "text-foreground" }: { title: string; value: number; color?: string }) {
  return (
    <Card className="bg-card/50 border-card-border text-center">
      <CardContent className="p-4">
        <div className="text-sm font-medium text-muted-foreground mb-1">{title}</div>
        <div className={`text-3xl font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
