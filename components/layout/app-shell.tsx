"use client";

import { useEffect, useCallback } from "react";

interface AppShellProps {
  children: React.ReactNode;
  panelOpen: boolean;
  onPanelClose: () => void;
}

export function AppShell({ children, panelOpen, onPanelClose }: AppShellProps) {
  useEffect(() => {
    document.body.style.overflow = panelOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [panelOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onPanelClose();
    },
    [onPanelClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return <div>{children}</div>;
}
