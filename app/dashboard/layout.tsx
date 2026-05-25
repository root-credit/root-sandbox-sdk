import { DomainStoreProvider } from '@/components/DomainStoreProvider';
import { WalletProvider } from '@/components/WalletContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DomainStoreProvider>
      <WalletProvider initialBalance={9500.00}>
        {children}
      </WalletProvider>
    </DomainStoreProvider>
  );
}
