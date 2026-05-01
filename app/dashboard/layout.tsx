import { ListingStoreProvider } from '@/components/ListingStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ListingStoreProvider>{children}</ListingStoreProvider>;
}
