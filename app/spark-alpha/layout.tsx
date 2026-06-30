import type { Metadata } from "next";
import "./spark-alpha.css";

export const metadata: Metadata = {
  title: "Spark Alpha™",
  description: "Relationship prototype — conversation is the interface",
};

/** Full-viewport shell — no page scroll; frosted panel stays fixed */
export default function SparkAlphaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="spark-alpha-layout" data-spark-alpha-layout>
      {children}
    </div>
  );
}
