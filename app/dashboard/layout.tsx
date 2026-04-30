import { DomainStoreProvider } from '@/components/DomainStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DomainStoreProvider>{children}</DomainStoreProvider>;
}
