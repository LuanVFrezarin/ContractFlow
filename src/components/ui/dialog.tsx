"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Dialog({
  open,
  onClose,
  children,
  title,
  description,
  className,
  size = "md",
}: DialogProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={cn(
          "relative z-50 w-full mx-4 bg-background rounded-xl border border-border shadow-xl animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto",
          sizes[size],
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4">
            <div>
              {title && (
                <h2 className="text-lg font-semibold text-foreground">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-accent transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn(!title && !description && "pt-6", "px-6 pb-6")}>
          {children}
        </div>
      </div>
    </div>
  );
}
