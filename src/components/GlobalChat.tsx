"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues
const SalesChat = dynamic(() => import("./SalesChat"), { ssr: false });

export default function GlobalChat() {
  return <SalesChat />;
}
