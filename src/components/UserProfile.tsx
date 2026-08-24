"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Settings, LogOut, User, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserData {
  name: string;
  email: string;
  avatar?: string;
}

export function UserProfile({ user }: { user?: UserData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If no user data, don't render
  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pl-1 pr-3 text-sm font-medium transition-colors hover:bg-muted"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="grid size-8 place-items-center rounded-full bg-signal/15 text-signal">
          <User className="size-4" aria-hidden="true" />
        </div>
        <span className="hidden max-w-[120px] truncate sm:block">{user.name}</span>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} aria-hidden="true" />

        {notifications > 0 && (
          <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-signal text-[10px] font-bold text-signal-foreground">
            {notifications}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-border bg-card p-2 shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="mt-2 flex flex-col gap-1">
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
              <User className="size-4" aria-hidden="true" />
              Profile
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
              <Bell className="size-4" aria-hidden="true" />
              Notifications
              {notifications > 0 && (
                <span className="ml-auto rounded-full bg-signal/15 px-2 py-0.5 text-[10px] font-medium text-signal">
                  {notifications} new
                </span>
              )}
            </button>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted">
              <Settings className="size-4" aria-hidden="true" />
              Settings
            </button>
            <div className="my-1 border-t border-border" />
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted text-red-500">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}