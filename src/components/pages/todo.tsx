import { useState, useEffect } from "react";
import { LoadingStar } from "../ui/loading-star";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent } from "../ui/card";
import { Plus, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export function TodoPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch("http://localhost:8000/api/todos", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTodos(data.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          createdAt: new Date(t.created_at)
        })));
      }
    } catch (error) {
      console.error("Failed to fetch todos", error);
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!input.trim()) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to add tasks");
        return;
      }

      const response = await fetch("http://localhost:8000/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: input.trim() })
      });

      if (response.ok) {
        const newTodoData = await response.json();
        const newTodo: TodoItem = {
          id: newTodoData.id,
          text: newTodoData.text,
          completed: newTodoData.completed,
          createdAt: new Date(newTodoData.created_at)
        };
        setTodos([newTodo, ...todos]);
        setInput("");
        toast.success("Task added successfully!");
      } else {
        toast.error("Failed to add task");
      }
    } catch (error) {
      console.error("Error adding todo:", error);
      toast.error("Failed to add task");
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // Optimistic update
    const updatedTodos = todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updatedTodos);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });

      if (!response.ok) {
        // Revert on error
        setTodos(todos);
        toast.error("Failed to update task");
      }
    } catch (error) {
      // Revert on error
      setTodos(todos);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTodo = async (id: string) => {
    // Optimistic update
    const previousTodos = todos;
    setTodos(todos.filter(t => t.id !== id));

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success("Task deleted");
      } else {
        setTodos(previousTodos);
        toast.error("Failed to delete task");
      }
    } catch (error) {
      setTodos(previousTodos);
      toast.error("Failed to delete task");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTodo();
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  if (isLoading) {
    return <LoadingStar />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-muted-foreground">To-Do List</h1>
        <p className="text-muted-foreground">
          Stay organized and track your tasks
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total Tasks</p>
              <p className="text-foreground">{totalCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-muted-foreground">Completed</p>
              <p className="text-foreground">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-muted-foreground">Remaining</p>
              <p className="text-foreground">{totalCount - completedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Todo */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a new task..."
              className="bg-background border-border"
            />
            <Button
              onClick={handleAddTodo}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Todo List */}
      <div className="space-y-2">
        {todos.map((todo) => (
          <Card key={todo.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleTodo(todo.id)}
                  className="border-border"
                />
                <div className="flex-1">
                  <p className={`text-foreground ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                    {todo.text}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{todo.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {todos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks yet. Add one to get started!</p>
        </div>
      )}
    </div>
  );
}
