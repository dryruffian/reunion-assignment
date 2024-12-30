'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/hooks';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Check, X, ArrowUpDown } from 'lucide-react';
import AddTaskModal from '@/components/AddTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import Navbar from '@/components/Navbar';


interface Todo {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'finished';
  priority: 'low' | 'medium' | 'high';
  endDate: string;
  startDate: string;
  isCompleted: boolean;
  completedAt?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface TodoResponse {
  status: string;
  data: {
    todos: Todo[];
  };
}

function Tasks() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);
  const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTodoForEdit, setSelectedTodoForEdit] = useState<Todo | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (isAuthenticated) {
      fetchTodos();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchTodos = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:5000/api/todos', {
        headers: {
          'Authorization': `Bearer ${token?.trim()}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch todos');
      
      const data: TodoResponse = await response.json();
      setTodos(data.data.todos);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleToggleComplete = async (todoId: string): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`http://localhost:5000/api/todos/${todoId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteSelected = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('accessToken');
      await Promise.all(
        selectedTodos.map(todoId =>
          fetch(`http://localhost:5000/api/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
      );
      setSelectedTodos([]);
      fetchTodos();
    } catch (error) {
      console.error('Error deleting todos:', error);
    }
  };

  const getPriorityColor = (priority: Todo['priority']): string => {
    const colors: Record<Todo['priority'], string> = {
      high: 'text-red-700 bg-red-100',
      medium: 'text-yellow-700 bg-yellow-100',
      low: 'text-green-700 bg-green-100'
    };
    return colors[priority] || '';
  };

  const getStatusColor = (status: Todo['status']): string => {
    return status === 'pending' 
      ? 'text-orange-700 bg-orange-100' 
      : 'text-green-700 bg-green-100';
  };

  const formatDateTime = (date: string): string => {
    return new Date(date).toLocaleString();
  };

  const calculateTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const hours = Math.round(diff / (1000 * 60 * 60));
    
    if (hours < 0) {
      return 'Overdue';
    }
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  };


  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortTodos = (a: Todo, b: Todo): number => {
    let comparison = 0;
    
    switch (sortField) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        break;
      case 'startDate':
        comparison = new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        break;
      case 'endDate':
        comparison = new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return sortOrder === 'asc' ? -comparison : comparison;
  };

  const filteredAndSortedTodos = todos
    .filter(todo => priorityFilter === 'all' || todo.priority === priorityFilter)
    .filter(todo => statusFilter === 'all' || todo.status === statusFilter)
    .sort(sortTodos);

  if (isLoading || isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar/>
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Tasks</h1>
          </div>
          <div className="flex items-center gap-4">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="finished">Finished</SelectItem>
              </SelectContent>
            </Select>


            <AddTaskModal onTaskAdded={fetchTodos} />

            {selectedTodos.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Selected ({selectedTodos.length})
              </Button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No tasks found. Create your first task!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
          
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedTodos.length === filteredAndSortedTodos.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTodos(filteredAndSortedTodos.map(todo => todo._id));
                        } else {
                          setSelectedTodos([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    Title 
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('priority')}
                  >
                    Priority 
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>

               
                  <TableHead>Status</TableHead>

                  
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('startDate')}
                  >
                    Start Date 
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>

            
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('endDate')}
                  >
                    End Date 
                    <ArrowUpDown className="inline ml-2 h-4 w-4" />
                  </TableHead>
                  <TableHead>Time Remaining</TableHead>

                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredAndSortedTodos.map((todo) => (
                  <TableRow key={todo._id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedTodos.includes(todo._id)}
                        onCheckedChange={(checked: boolean) => {
                          setSelectedTodos(prev => 
                            checked 
                              ? [...prev, todo._id]
                              : prev.filter(id => id !== todo._id)
                          );
                        }}
                      />
                    </TableCell>

       
                    <TableCell className="font-medium">{todo.title}</TableCell>

              
                    <TableCell>
                      <Badge className={getPriorityColor(todo.priority)}>
                        {todo.priority}
                      </Badge>
                    </TableCell>

                   
                    <TableCell>
                      <Badge className={getStatusColor(todo.status)}>
                        {todo.status}
                      </Badge>
                    </TableCell>

                    <TableCell>{formatDateTime(todo.startDate)}</TableCell>


                    <TableCell>{formatDateTime(todo.endDate)}</TableCell>

         
                    <TableCell>{calculateTimeRemaining(todo.endDate)}</TableCell>

           
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleComplete(todo._id)}
                        >
                          {todo.isCompleted ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTodoForEdit(todo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {selectedTodoForEdit && (
        <EditTaskModal 
          todo={selectedTodoForEdit} 
          onClose={() => setSelectedTodoForEdit(null)}
          onTaskUpdated={() => {
            fetchTodos();
            setSelectedTodoForEdit(null);
          }}
        />
      )}
    </div>
    </>
  );
}

export default Tasks;