'use client';

import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export function Modal({ isOpen, title, children, onClose, className }: ModalProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
        className={cn('relative z-10 w-full max-w-lg rounded-md bg-background p-6 shadow-lg', className)}
      >
        <div className="flex items-start justify-between">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-md p-2 hover:bg-muted"
          >
            ×
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
