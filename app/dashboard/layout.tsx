import { ServiceStoreProvider } from '@/components/ServiceStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ServiceStoreProvider>{children}</ServiceStoreProvider>;
}
