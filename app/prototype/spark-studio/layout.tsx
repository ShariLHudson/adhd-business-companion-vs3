/** Full-viewport shell for Spark Studio prototype — no companion chrome. */
export default function SparkStudioPrototypeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="spark-studio-layout-root">{children}</div>;
}
