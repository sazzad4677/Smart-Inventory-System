"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useSocket } from "@/hooks/use-socket";

const STORAGE_KEY = "inventory_notifications";

interface Notification {
  id: string;
  productName: string;
  currentStock: number;
  message: string;
  timestamp: Date | string;
}

// Lazy initializer — runs once on mount, not during render
function loadFromStorage(): Notification[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

const NotificationBell = () => {
  // Lazy initializer reads localStorage once, avoids setState-in-effect lint error
  const [notifications, setNotifications] =
    useState<Notification[]>(loadFromStorage);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const socketRef = useSocket();

  // Listen for real-time low_stock_alert events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleAlert = (notification: Notification) => {
      setNotifications((prev) => {
        const updated = [notification, ...prev];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    socket.on("low_stock_alert", handleAlert);

    return () => {
      socket.off("low_stock_alert", handleAlert);
    };
  }, [socketRef]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    setIsOpen(false);
  };

  const formatTime = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date(date));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
      >
        <Bell className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-[9999] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-800">
              Notifications
            </h3>
            {notifications.length > 0 && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {notifications.length} New
              </span>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-gray-800 leading-tight mb-1">
                      {notification.message}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="w-full p-3 text-xs font-medium text-blue-600 hover:bg-blue-50 border-t border-gray-50 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
