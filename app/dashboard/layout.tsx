import { CryptoStoreProvider } from '@/components/CryptoStoreProvider';
import { DomainStoreProvider } from '@/components/DomainStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CryptoStoreProvider>
      <DomainStoreProvider>{children}</DomainStoreProvider>
    </CryptoStoreProvider>
  );
}
