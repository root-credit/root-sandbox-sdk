import { WalletProvider } from '@/components/WalletProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
