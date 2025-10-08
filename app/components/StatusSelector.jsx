"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // <-- 1. Impor createPortal
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDownIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

export default function StatusSelector({ currentStatus, onStatusChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 }); // <-- 2. State untuk menyimpan posisi
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const statuses = ['To Do', 'In Progress', 'Done'];
    const statusStyles = {
        'To Do': 'bg-slate-100 text-slate-700 hover:bg-slate-200',
        'In Progress': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        'Done': 'bg-green-100 text-green-700 hover:bg-green-200',
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target) && buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- 3. LOGIKA BARU UNTUK MENGHITUNG POSISI ---
    const handleToggle = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            
            if (spaceBelow < 150) { // Buka ke atas
                setPosition({ 
                    bottom: window.innerHeight - rect.top, 
                    left: rect.left, 
                    width: rect.width 
                });
            } else { // Buka ke bawah
                setPosition({ 
                    top: rect.bottom, 
                    left: rect.left, 
                    width: rect.width 
                });
            }
        }
        setIsOpen(!isOpen);
    };

    const handleSelect = (newStatus) => {
        if (newStatus !== currentStatus) {
            onStatusChange(newStatus);
        }
        setIsOpen(false);
    };

    // --- 4. KOMPONEN MENU DROPDOWN TERPISAH ---
    const DropdownMenu = () => {
        const style = {
            left: `${position.left}px`,
            width: `${position.width}px`,
            ...(position.top && { top: `${position.top}px` }),
            ...(position.bottom && { bottom: `${position.bottom}px` }),
        };

        return createPortal(
            <motion.div
                ref={menuRef}
                style={style}
                initial={{ opacity: 0, y: position.bottom ? 10 : -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: position.bottom ? 10 : -10 }}
                className="fixed z-50 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
                <div className="py-1">
                    {statuses.map(status => (
                        <button
                            key={status}
                            onClick={() => handleSelect(status)}
                            disabled={currentStatus === status}
                            className="w-full text-left block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed"
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </motion.div>,
            document.getElementById('portal-root')
        );
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={handleToggle}
                className={`flex items-center justify-between gap-2 px-3 py-1 text-xs font-bold rounded-full transition-colors w-32 ${statusStyles[currentStatus]}`}
            >
                <span>{currentStatus}</span>
                <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && <DropdownMenu />}
            </AnimatePresence>
        </div>
    );
}