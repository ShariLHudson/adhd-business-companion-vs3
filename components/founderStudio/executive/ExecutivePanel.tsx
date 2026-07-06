import type { ReactNode } from "react";

import { FounderPanel } from "../FounderPanel";

type ExecutivePanelProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export function ExecutivePanel(props: ExecutivePanelProps) {
  return <FounderPanel {...props} />;
}
