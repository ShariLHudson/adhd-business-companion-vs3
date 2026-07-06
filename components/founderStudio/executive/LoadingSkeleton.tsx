export function LoadingSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="founder-loading-skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => (
        <div
          key={index}
          className="founder-loading-skeleton__line"
          style={{ width: `${88 - index * 12}%` }}
        />
      ))}
    </div>
  );
}
