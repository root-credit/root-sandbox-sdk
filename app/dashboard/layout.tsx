import { RentalStoreProvider } from '@/components/RentalStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RentalStoreProvider>{children}</RentalStoreProvider>;
}
