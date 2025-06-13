// components/ui/alert.tsx
import React from 'react'

export function Alert({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) {
  return (
    <div className={`p-4 rounded-md border ${
      variant === 'destructive'
        ? 'bg-red-100 border-red-400 text-red-800'
        : 'bg-gray-100 border-gray-300 text-gray-800'
    } ${className}`}>
      {children}
    </div>
  )
}

export function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-semibold mb-1">{children}</h3>
}

export function AlertDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm">{children}</p>
}
