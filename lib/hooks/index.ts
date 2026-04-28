/**
 * Single re-export entry for the hook layer.
 *
 * v0 / LLM contract:
 *   import { usePayees, useTransactions, useProcessPayout } from '@/lib/hooks';
 */
export { useSession, type OperatorSession } from './useSession';
export { usePayees } from './usePayees';
export { useTransactions } from './useTransactions';
export { useMerchant, useLinkBank } from './useMerchant';
export { useProcessPayout } from './useProcessPayout';
export { useCreatePayee, useRemovePayee } from './useCreatePayee';
export { useLogin, useSignup, useLogout, type LoginOutcome } from './useAuth';
export {
  useAdminAuth,
  useAdminPayees,
  useAdminOperations,
  type AdminPayeeRow,
  type AdminMessage,
} from './useAdmin';
