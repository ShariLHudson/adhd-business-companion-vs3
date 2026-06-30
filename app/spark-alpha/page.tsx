"use client";

import { SparkAlphaPage } from "@/components/sparkAlpha/SparkAlphaPage";
import "./spark-alpha.css";

const ALLOWED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SPARK_ALPHA === "true";

/** Spark Alpha™ — Relationship Prototype. Development / flagged only. */
export default function SparkAlphaRoute() {
  if (!ALLOWED) {
    return (
      <main className="spark-alpha-root" style={{ padding: "2rem" }}>
        Spark Alpha™ is available in development, or set NEXT_PUBLIC_SPARK_ALPHA=true.
      </main>
    );
  }

  return <SparkAlphaPage />;
}
