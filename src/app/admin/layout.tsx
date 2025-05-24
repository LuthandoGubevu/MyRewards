
// This layout can be used if specific layout styling is needed for the admin section
// For now, it will just pass children through, relying on AppContent for global layout.
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

    