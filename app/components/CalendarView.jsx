// app/components/CalendarView.jsx
"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;

export default function CalendarView({ tasks, onTaskClick }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const tasksByDate = useMemo(() => {
        return tasks.reduce((acc, task) => {
            if (task.due_date) {
                const date = task.due_date;
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(task);
            }
            return acc;
        }, {});
    }, [tasks]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const days = Array.from({ length: startDay }, (_, i) => ({ key: `empty-${i}`, empty: true }));
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];
        days.push({
            key: dateString,
            day,
            dateString,
            tasks: tasksByDate[dateString] || []
        });
    }

    const changeMonth = (amount) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden p-6">
            <header className="flex items-center justify-between mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeftIcon /></button>
                <h2 className="text-xl font-bold text-slate-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100"><ChevronRightIcon /></button>
            </header>
            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-xs text-slate-500 py-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map(dayInfo => (
                    <div
                        key={dayInfo.key}
                        className={`h-32 border border-slate-200 rounded-md p-2 flex flex-col ${dayInfo.empty ? 'bg-slate-50' : ''}`}
                    >
                        {!dayInfo.empty && (
                            <>
                                <span className="font-semibold text-sm">{dayInfo.day}</span>
                                <div className="mt-1 space-y-1 overflow-y-auto">
                                    {dayInfo.tasks.map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => onTaskClick(task)}
                                            className="w-full text-left text-xs p-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 truncate"
                                        >
                                            {task.task_title}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}