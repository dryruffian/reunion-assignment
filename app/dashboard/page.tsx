'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/hooks';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState({
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
  const router = useRouter()
  useEffect(() => {
    // Check authentication first
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
        const response = await fetch('http://localhost:5000/api/todos',{
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

    const processDashboardData = (todos: any[]) => {
      const totalTasks = todos.length;
      const completedTasks = todos.filter(todo => todo.isCompleted).length;
      const pendingTasks = totalTasks - completedTasks;
    
      const completedTaskTimes = todos
        .filter(todo => todo.isCompleted && todo.completedAt)
        .map(todo => {
          const start = new Date(todo.startDate).getTime();
          const end = new Date(todo.completedAt).getTime();
          return (end - start) / (1000 * 60 * 60); // Time in hours
        });
    
      const avgCompletionTime =
        completedTaskTimes.length > 0
          ? (completedTaskTimes.reduce((a, b) => a + b, 0) / completedTaskTimes.length).toFixed(1)
          : 0;
    
      const pendingDetails = todos
        .filter(todo => !todo.isCompleted)
        .reduce(
          (acc, todo) => {
            const priority = todo.priority.toLowerCase(); // Ensure case-insensitive comparison
            const start = new Date(todo.startDate).getTime();
            const now = Date.now();
            const end = new Date(todo.endDate).getTime();
    
            const lapsedTime = (now - start) / (1000 * 60 * 60); // Time in hours
            const timeToFinish = (end - now) / (1000 * 60 * 60); // Time in hours
    
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
          totalTimeLapsed: pendingDetails.totalTimeLapsed.toFixed(1),
          totalTimeToFinish: pendingDetails.totalTimeToFinish.toFixed(1),
          priorities: pendingDetails.priorities.sort((a, b) =>
            a.priority.localeCompare(b.priority)
          ),
        },
      });
    };
    

    fetchData();
  }, []);

  return (
    <>
    <Navbar/>
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">{summary.totalTasks}</h3>
            <p className="text-lg">Total tasks</p>
          </div>
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">
              {((summary.completedTasks / summary.totalTasks) * 100).toFixed(0) || 0}%
            </h3>
            <p className="text-lg">Tasks completed</p>
          </div>
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">
              {((summary.pendingTasks / summary.totalTasks) * 100).toFixed(0) || 0}%
            </h3>
            <p className="text-lg">Tasks pending</p>
          </div>
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">{summary.avgCompletionTime || 0} hrs</h3>
            <p className="text-lg">Avg time per completed task</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Pending task summary</h2>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">{summary.pendingDetails.totalPending}</h3>
            <p className="text-lg">Pending tasks</p>
          </div>
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">{summary.pendingDetails.totalTimeLapsed} hrs</h3>
            <p className="text-lg">Total time lapsed</p>
          </div>
          <div className="bg-gray-100 p-4 text-center rounded shadow">
            <h3 className="text-5xl font-bold text-blue-600">{summary.pendingDetails.totalTimeToFinish} hrs</h3>
            <p className="text-lg">Total time to finish</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-left">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 border border-gray-300">Task priority</th>
                <th className="px-4 py-2 border border-gray-300">Pending tasks</th>
                <th className="px-4 py-2 border border-gray-300">Time lapsed (hrs)</th>
                <th className="px-4 py-2 border border-gray-300">Time to finish (hrs)</th>
              </tr>
            </thead>
            <tbody>
              {summary.pendingDetails.priorities.map(priority => (
                <tr key={priority.priority}>
                  <td className="px-4 py-2 border border-gray-300">{priority.priority}</td>
                  <td className="px-4 py-2 border border-gray-300">{priority.count}</td>
                  <td className="px-4 py-2 border border-gray-300">{priority.timeLapsed.toFixed(1)}</td>
                  <td className="px-4 py-2 border border-gray-300">{priority.timeToFinish.toFixed(1)}</td>
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
