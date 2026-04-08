"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";

interface AnalyticsEvent {
  eventName: string;
  url: string;
  properties?: Record<string, unknown>;
  createdAt: string;
}

interface AnalyticsContextType {
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();
  const eventsQueue = useRef<AnalyticsEvent[]>([]);

  const trackEvent = useCallback(
    (eventName: string, properties?: Record<string, unknown>) => {
      const event: AnalyticsEvent = {
        eventName,
        url: window.location.href,
        properties,
        createdAt: new Date().toISOString(),
      };
      eventsQueue.current.push(event);
    },
    [],
  );

  const flushEvents = useCallback(() => {
    if (eventsQueue.current.length === 0) return;

    // We can use navigator.sendBeacon for page unloads or a simple fetch for intervals
    const payload = JSON.stringify({ events: eventsQueue.current });
    const blob = new Blob([payload], { type: "application/json" });

    // Clear queue before sending
    eventsQueue.current = [];

    // Backend analytics endpoint MUST be absolute URL to the backend or through the proxy
    // Using proxy path '/api/analytics/events'
    const endpoint = "/api/analytics/events";

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, blob);
    } else {
      fetch(endpoint, {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
      }).catch((err) => console.error("Failed to send analytics", err));
    }
  }, []);

  // Track page views
  useEffect(() => {
    if (pathname) {
      trackEvent("PAGE_VIEW", { pathname });
    }
  }, [pathname, trackEvent]);

  // Flush on interval and on page unload
  useEffect(() => {
    const interval = setInterval(() => {
      flushEvents();
    }, 10000); // Flush every 10 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushEvents();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", flushEvents);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", flushEvents);
      flushEvents(); // Flush when context unmounts
    };
  }, [flushEvents]);

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
