type EmptyStateProps = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <div className="founder-empty-state">
      <p className="founder-empty-state__title">{title}</p>
      <p className="founder-empty-state__message">{message}</p>
    </div>
  );
}
