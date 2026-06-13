import { CompanionAuthProvider } from "@/components/companion/CompanionAuthProvider";

import "./companion.css";

export default function CompanionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <CompanionAuthProvider>{children}</CompanionAuthProvider>;
}
