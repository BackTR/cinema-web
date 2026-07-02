'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface FormFieldProps {
    label: string;
    error?: string;
    success?: boolean;
    hint?: string;
    required?: boolean;
    children: React.ReactNode;
    rightLabel?: React.ReactNode;
}

export function FormField({
    label, error, success, hint, required, children, rightLabel,
    }: FormFieldProps) {
    return (
        <div className="space-y-1">
        <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-300">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {rightLabel}
        </div>

        <div className="relative">
            {children}

            {/* Status icon di kanan input */}
            {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {error ? (
                <AlertCircle className="w-4 h-4 text-red-400" />
                ) : (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
            </div>
            )}
        </div>

        {/* Inline error dengan animasi */}
        <AnimatePresence mode="wait">
            {error && (
            <motion.p
                key="error"
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.15 }}
                className="text-red-400 text-xs flex items-center gap-1"
            >
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error}
            </motion.p>
            )}
            {!error && hint && (
            <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-500 text-xs"
            >
                {hint}
            </motion.p>
            )}
        </AnimatePresence>
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    success?: boolean;
    }

    export function Input({ error, success, className = '', ...props }: InputProps) {
    return (
        <input
        {...props}
        className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white 
            placeholder-gray-500 focus:outline-none transition-all pr-10
            ${error
            ? 'border-red-500 focus:border-red-400 bg-red-900/10'
            : success
            ? 'border-green-500 focus:border-green-400'
            : 'border-gray-700 focus:border-red-500'
            }
            ${className}`}
        />
    );
}

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: boolean;
    success?: boolean;
}

export function PasswordInput({ error, success, className = '', ...props }: PasswordInputProps) {
    const [show, setShow] = useState(false);

    return (
        <div className="relative">
        <input
            {...props}
            type={show ? 'text' : 'password'}
            className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white 
            placeholder-gray-500 focus:outline-none transition-all pr-20
            ${error
                ? 'border-red-500 focus:border-red-400 bg-red-900/10'
                : success
                ? 'border-green-500 focus:border-green-400'
                : 'border-gray-700 focus:border-red-500'
            }
            ${className}`}
        />
        <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
            {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        </div>
    );
}