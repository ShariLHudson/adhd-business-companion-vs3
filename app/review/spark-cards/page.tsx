"use client";

import { SparkCardReviewMode } from "@/components/review/SparkCardReviewMode";
import "./spark-card-review.css";

/**
 * Private Spark Card Review Mode — internal review/QA only.
 * Development-only, or explicitly enabled with NEXT_PUBLIC_SPARK_REVIEW=true.
 * Never linked from the member experience.
 */
const ALLOWED =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_SPARK_REVIEW === "true";

export default function SparkCardReviewRoute() {
  if (!ALLOWED) {
    return (
      <main className="scr-gate">
        Spark Card Review is an internal tool. It is available in development, or
        set <code>NEXT_PUBLIC_SPARK_REVIEW=true</code>.
      </main>
    );
  }

  return <SparkCardReviewMode />;
}
