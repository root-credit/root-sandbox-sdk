import { CryptoStoreProvider } from '@/components/CryptoStoreProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <CryptoStoreProvider>{children}</CryptoStoreProvider>;
}
