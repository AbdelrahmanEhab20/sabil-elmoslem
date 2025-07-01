'use client';

import React, { useEffect, useRef } from 'react';

interface CustomModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const CustomModal: React.FC<CustomModalProps> = ({
    isOpen,
    onClose,
    children,
    title
}) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Store the currently focused element
            previousActiveElement.current = document.activeElement as HTMLElement;

            // Focus the modal
            if (modalRef.current) {
                modalRef.current.focus();
            }

            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Restore body scroll
            document.body.style.overflow = 'unset';

            // Restore focus to the previous element
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    ref={modalRef}
                    className="relative mx-auto max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-green-200 dark:border-green-700 p-8"
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? 'modal-title' : undefined}
                >
                    {title && (
                        <h2 id="modal-title" className="text-2xl font-bold text-green-700 dark:text-green-300 mb-4 text-center">
                            {title}
                        </h2>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
};

export default CustomModal; 