'use client';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Todo {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'finished';
  priority: 'low' | 'medium' | 'high';
  endDate: string;
  startDate: string;
  isCompleted: boolean;
}

interface EditTaskModalProps {
  todo: Todo;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export default function EditTaskModal({ todo, onClose, onTaskUpdated }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Omit<Todo, '_id'>>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    endDate: '',
    startDate: '',
    isCompleted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      title: todo.title,
      description: todo.description || '',
      status: todo.status,
      priority: todo.priority,
      endDate: new Date(todo.endDate).toISOString().slice(0, 16),
      isCompleted: todo.isCompleted,
      startDate: new Date(todo.startDate).toISOString().slice(0, 16)
    });
  }, [todo]);

  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:5000/api/todos/${todo._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          endDate: formatDateForBackend(formData.endDate),
          startDate:formatDateForBackend(formData.startDate)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task');
      }

      onTaskUpdated();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update task');
      console.error('Error updating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get current datetime string in local format for input min value
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'finished') => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="datetime-local"
              min={getCurrentDateTime()}
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}