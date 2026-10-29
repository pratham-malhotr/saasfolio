"use client";
import { useEffect } from "react";
import { errorReference, reportClientError } from "@/lib/client-diagnostics";
/* A full document navigation also recovers a broken root layout. */
/* eslint-disable @next/next/no-html-link-for-pages */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => { reportClientError(error); }, [error]);
  return <html lang="en"><body style={{ margin: 0, padding: "15vh 24px", background: "#050505", color: "#ededed", fontFamily: "system-ui", textAlign: "center", minHeight: "70vh" }}><h1>This page could not load</h1><p>Please try again. If the problem continues, contact support and include the reference below.</p>{errorReference(error) && <p>Reference: {errorReference(error)}</p>}<button type="button" onClick={retry} style={{ padding: "12px 24px", cursor: "pointer" }}>Try again</button><p><a href="/" style={{ color: "#c6ff3d" }}>Go to the homepage</a></p></body></html>;
}
