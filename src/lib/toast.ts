import toast from 'react-hot-toast';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

interface ToastOptions {
    duration?: number;
}

export const showToast = {
    success: (message: string, options?: ToastOptions) => {
        toast.custom(
        (t) =>
            React.createElement(
            'div',
            {
                className: `${t.visible ? 'animate-enter' : 'animate-leave'} 
                max-w-sm w-full bg-gray-900 border border-green-500/30 shadow-lg rounded-xl 
                pointer-events-auto flex items-start gap-3 p-4`,
            },
            React.createElement(CheckCircle2, {
                className: 'w-5 h-5 text-green-400 flex-shrink-0 mt-0.5',
            }),
            React.createElement(
                'div',
                null,
                React.createElement('p', { className: 'text-white text-sm font-medium' }, message),
            ),
            React.createElement(
                'button',
                {
                onClick: () => toast.dismiss(t.id),
                className: 'ml-auto text-gray-500 hover:text-white',
                },
                '✕',
            ),
            ),
        { duration: options?.duration ?? 4000 },
        );
    },

    error: (message: string, field?: string, options?: ToastOptions) => {
        toast.custom(
        (t) =>
            React.createElement(
            'div',
            {
                className: `${t.visible ? 'animate-enter' : 'animate-leave'}
                max-w-sm w-full bg-gray-900 border border-red-500/30 shadow-lg rounded-xl
                pointer-events-auto flex items-start gap-3 p-4`,
            },
            React.createElement(XCircle, {
                className: 'w-5 h-5 text-red-400 flex-shrink-0 mt-0.5',
            }),
            React.createElement(
                'div',
                null,
                field &&
                React.createElement(
                    'p',
                    { className: 'text-red-400 text-xs font-medium mb-0.5' },
                    field,
                ),
                React.createElement('p', { className: 'text-white text-sm' }, message),
            ),
            React.createElement(
                'button',
                {
                onClick: () => toast.dismiss(t.id),
                className: 'ml-auto text-gray-500 hover:text-white',
                },
                '✕',
            ),
            ),
        { duration: options?.duration ?? 5000 },
        );
    },

    warning: (message: string, options?: ToastOptions) => {
        toast.custom(
        (t) =>
            React.createElement(
            'div',
            {
                className: `${t.visible ? 'animate-enter' : 'animate-leave'}
                max-w-sm w-full bg-gray-900 border border-yellow-500/30 shadow-lg rounded-xl
                pointer-events-auto flex items-start gap-3 p-4`,
            },
            React.createElement(AlertTriangle, {
                className: 'w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5',
            }),
            React.createElement('p', { className: 'text-white text-sm' }, message),
            React.createElement(
                'button',
                {
                onClick: () => toast.dismiss(t.id),
                className: 'ml-auto text-gray-500 hover:text-white',
                },
                '✕',
            ),
            ),
        { duration: options?.duration ?? 4000 },
        );
    },

    info: (message: string, options?: ToastOptions) => {
        toast.custom(
        (t) =>
            React.createElement(
            'div',
            {
                className: `${t.visible ? 'animate-enter' : 'animate-leave'}
                max-w-sm w-full bg-gray-900 border border-blue-500/30 shadow-lg rounded-xl
                pointer-events-auto flex items-start gap-3 p-4`,
            },
            React.createElement(Info, {
                className: 'w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5',
            }),
            React.createElement('p', { className: 'text-white text-sm' }, message),
            React.createElement(
                'button',
                {
                onClick: () => toast.dismiss(t.id),
                className: 'ml-auto text-gray-500 hover:text-white',
                },
                '✕',
            ),
            ),
        { duration: options?.duration ?? 4000 },
        );
    },
};