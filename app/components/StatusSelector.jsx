"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ChevronDownIcon = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

export default function StatusSelector({ currentStatus, onStatusChange, disabled = false, restrictedOptions = [] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const statuses = ['To Do', 'In Progress', 'Waiting Verification', 'Done'];
    
    // --- UPDATE LABEL DI SINI ---
    const statusLabels = {
        'To Do': 'To Do',
        'In Progress': 'In Progress',
        'Waiting Verification': 'Done (Waiting Verification)', // Ubah Label
        'Done': 'Done' // Ubah Label
    };

    const statusStyles = {
        'To Do': 'bg-slate-100 text-slate-700',
        'In Progress': 'bg-blue-100 text-blue-700',
        'Waiting Verification': 'bg-amber-100 text-amber-800',
        'Done': 'bg-green-100 text-green-700',
    };

    const handleToggle = () => {
        if (disabled) return;

        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            
            if (spaceBelow < 200) {
                setPosition({ bottom: window.innerHeight - rect.top, left: rect.left, width: rect.width });
            } else {
                setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
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

    const getButtonStyle = () => {
        const baseStyle = statusStyles[currentStatus] || 'bg-slate-100 text-slate-600';
        if (disabled) return `${baseStyle} opacity-60 cursor-not-allowed`;
        
        if (currentStatus === 'To Do') return `${baseStyle} hover:bg-slate-200`;
        if (currentStatus === 'In Progress') return `${baseStyle} hover:bg-blue-200`;
        if (currentStatus === 'Waiting Verification') return `${baseStyle} hover:bg-amber-200`;
        if (currentStatus === 'Done') return `${baseStyle} hover:bg-green-200`;
        return baseStyle;
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

    const DropdownMenu = () => {
        const style = {
            left: `${position.left}px`,
            width: 'max-content',
            minWidth: `${position.width}px`,
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
                className="fixed z-50 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden"
            >
                <div className="py-1">
                    {statuses.map(status => {
                        const isRestricted = restrictedOptions.includes(status);
                        
                        return (
                            <button
                                key={status}
                                onClick={() => !isRestricted && handleSelect(status)}
                                disabled={currentStatus === status || isRestricted}
                                className={`w-full text-left block px-4 py-2 text-sm whitespace-nowrap
                                    ${isRestricted 
                                        ? 'text-slate-400 cursor-not-allowed bg-slate-50' 
                                        : 'text-slate-700 hover:bg-slate-100'
                                    }
                                    ${currentStatus === status ? 'font-bold bg-slate-50' : ''}
                                `}
                                title={isRestricted ? "Anda tidak memiliki akses ke status ini" : ""}
                            >
                                {statusLabels[status]} {isRestricted && <span className="text-[10px] ml-1 text-red-400">🔒</span>}
                            </button>
                        );
                    })}
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
                disabled={disabled}
                className={`flex items-center justify-between gap-2 px-3 py-1 text-xs font-bold rounded-full transition-colors min-w-[100px] ${getButtonStyle()}`}
            >
                <span className="truncate">{statusLabels[currentStatus] || currentStatus}</span>
                {!disabled && (
                    <ChevronDownIcon className={`w-3 h-3 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && <DropdownMenu />}
            </AnimatePresence>
        </div>
    );
}