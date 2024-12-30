'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/hooks';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

// Define interfaces for your data structures
interface PriorityData {
  priority: string;
  count: number;
  timeLapsed: number;
  timeToFinish: number;
}

interface PendingDetails {
  totalPending: number;
  totalTimeLapsed: number;
  totalTimeToFinish: number;
  priorities: PriorityData[];
}

interface DashboardSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  avgCompletionTime: number;
  pendingDetails: PendingDetails;
}

interface Todo {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  priority: string;
  isCompleted: boolean;
  completedAt?: string;
}

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    avgCompletionTime: 0,
    pendingDetails: {
      totalPending: 0,
      totalTimeLapsed: 0,
      totalTimeToFinish: 0,
      priorities: [],
    },
  });

  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:5000/api/todos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (data.status === 'success') {
          processDashboardData(data.data.todos);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const processDashboardData = (todos: Todo[]) => {
      const totalTasks = todos.length;
      const completedTasks = todos.filter(todo => todo.isCompleted).length;
      const pendingTasks = totalTasks - completedTasks;

      const completedTaskTimes = todos
        .filter(todo => todo.isCompleted && todo.completedAt)
        .map(todo => {
          const start = new Date(todo.startDate).getTime();
          const end = new Date(todo.completedAt!).getTime();
          return (end - start) / (1000 * 60 * 60);
        });

      const avgCompletionTime =
        completedTaskTimes.length > 0
          ? (completedTaskTimes.reduce((a, b) => a + b, 0) / completedTaskTimes.length).toFixed(1)
          : 0;

      interface AccumulatorType {
        totalPending: number;
        totalTimeLapsed: number;
        totalTimeToFinish: number;
        priorities: PriorityData[];
      }

      const pendingDetails = todos
        .filter(todo => !todo.isCompleted)
        .reduce<AccumulatorType>(
          (acc, todo) => {
            const priority = todo.priority.toLowerCase();
            const start = new Date(todo.startDate).getTime();
            const now = Date.now();
            const end = new Date(todo.endDate).getTime();

            const lapsedTime = (now - start) / (1000 * 60 * 60);
            const timeToFinish = (end - now) / (1000 * 60 * 60);

            acc.totalPending += 1;
            acc.totalTimeLapsed += lapsedTime > 0 ? lapsedTime : 0;
            acc.totalTimeToFinish += timeToFinish > 0 ? timeToFinish : 0;

            const priorityData = acc.priorities.find(p => p.priority === priority) || {
              priority,
              count: 0,
              timeLapsed: 0,
              timeToFinish: 0,
            };

            priorityData.count += 1;
            priorityData.timeLapsed += lapsedTime > 0 ? lapsedTime : 0;
            priorityData.timeToFinish += timeToFinish > 0 ? timeToFinish : 0;

            if (!acc.priorities.find(p => p.priority === priority)) {
              acc.priorities.push(priorityData);
            }

            return acc;
          },
          {
            totalPending: 0,
            totalTimeLapsed: 0,
            totalTimeToFinish: 0,
            priorities: [],
          }
        );

      setSummary({
        totalTasks,
        completedTasks,
        pendingTasks,
        avgCompletionTime: Number(avgCompletionTime),
        pendingDetails: {
          totalPending: pendingDetails.totalPending,
          totalTimeLapsed: Number(pendingDetails.totalTimeLapsed.toFixed(1)),
          totalTimeToFinish: Number(pendingDetails.totalTimeToFinish.toFixed(1)),
          priorities: pendingDetails.priorities.sort((a, b) =>
            a.priority.localeCompare(b.priority)
          ),
        },
      });
    };

    fetchData();
  }, []);

  // Rest of your JSX remains the same...
  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Summary Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Tasks */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">
                {summary.totalTasks}
              </h3>
              <p className="text-gray-600 text-lg">Total tasks</p>
            </div>
  
            {/* Tasks Completed */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-green-600 mb-2">
                {((summary.completedTasks / summary.totalTasks) * 100).toFixed(0) || 0}%
              </h3>
              <p className="text-gray-600 text-lg">Tasks completed</p>
            </div>
  
            {/* Tasks Pending */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-orange-600 mb-2">
                {((summary.pendingTasks / summary.totalTasks) * 100).toFixed(0) || 0}%
              </h3>
              <p className="text-gray-600 text-lg">Tasks pending</p>
            </div>
  
            {/* Average Completion Time */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-purple-600 mb-2">
                {summary.avgCompletionTime || 0} hrs
              </h3>
              <p className="text-gray-600 text-lg">Avg time per completed task</p>
            </div>
          </div>
        </section>
  
        {/* Pending Tasks Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Pending task summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Pending */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-blue-600 mb-2">
                {summary.pendingDetails.totalPending}
              </h3>
              <p className="text-gray-600 text-lg">Pending tasks</p>
            </div>
  
            {/* Time Lapsed */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-red-600 mb-2">
                {summary.pendingDetails.totalTimeLapsed} hrs
              </h3>
              <p className="text-gray-600 text-lg">Total time lapsed</p>
            </div>
  
            {/* Time to Finish */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-4xl font-bold text-green-600 mb-2">
                {summary.pendingDetails.totalTimeToFinish} hrs
              </h3>
              <p className="text-gray-600 text-lg">Total time to finish</p>
            </div>
          </div>
  
          {/* Priority Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending tasks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time lapsed (hrs)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time to finish (hrs)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.pendingDetails.priorities.map((priority, index) => (
                  <tr key={priority.priority} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${priority.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          priority.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {priority.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {priority.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {priority.timeLapsed.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {priority.timeToFinish.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;