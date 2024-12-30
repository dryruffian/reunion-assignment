'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Plus } from 'lucide-react';

interface ValidationError {
  path: (string | number)[];
  message: string;
}

interface TaskForm {
  title: string;
  description: string;
  status: 'pending' | 'finished';
  priority: 'low' | 'medium' | 'high';
  endDate: string;
  startDate: string;
  isCompleted: boolean;
}

interface AddTaskModalProps {
  onTaskAdded: () => void;
}

export default function AddTaskModal({ onTaskAdded }: AddTaskModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<TaskForm>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    startDate: '',
    endDate: '',
    isCompleted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString();
  };

  const getFieldError = (fieldName: string): string => {
    const error = errors.find(err => err.path[0] === fieldName);
    return error ? error.message : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          endDate: formatDateForBackend(formData.endDate),
          startDate: formatDateForBackend(formData.startDate)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
          throw new Error('Validation failed');
        }
        throw new Error(data.message || 'Failed to create task');
      }

      setIsOpen(false);
      onTaskAdded();
      resetForm();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      endDate: '',
      isCompleted: false
    });
    setErrors([]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title (max 100 characters)"
              maxLength={100}
              required
              className={getFieldError('title') ? 'border-red-500' : ''}
            />
            {getFieldError('title') && (
              <p className="text-sm text-red-500">{getFieldError('title')}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description (max 500 characters)"
              maxLength={500}
              className={getFieldError('description') ? 'border-red-500' : ''}
            />
            {getFieldError('description') && (
              <p className="text-sm text-red-500">{getFieldError('description')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                setFormData(prev => ({ ...prev, priority: value }))
              }
            >
              <SelectTrigger className={getFieldError('priority') ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError('priority') && (
              <p className="text-sm text-red-500">{getFieldError('priority')}</p>
            )}
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
              className={getFieldError('endDate') ? 'border-red-500' : ''}
            />
            {getFieldError('endDate') && (
              <p className="text-sm text-red-500">{getFieldError('endDate')}</p>
            )}
          </div>

          <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                    id="startDate"
                    type="datetime-local"
                    min={getCurrentDateTime()}
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    className={getFieldError('startDate') ? 'border-red-500' : ''}
                />
                {getFieldError('startDate') && (
                    <p className="text-sm text-red-500">{getFieldError('startDate')}</p>
                )}
                </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}