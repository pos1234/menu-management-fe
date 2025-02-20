'use client';

import React from 'react';
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div className={cn("w-64 bg-[#1A1C1E] h-screen", className)}>
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-800">
          <span className="text-white text-xl font-semibold">CLOIT</span>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 py-2">
          <div className="px-3 space-y-1">
         
            <button className="w-full text-left px-3 py-2 bg-[#00A550] text-white rounded-md">
              Menus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 