import { useState, useEffect, useCallback } from 'react';
import {
  CashRewardState,
  getCashRewardState,
  recordScanMilestone,
  processUPIWithdrawal,
} from '@/lib/cashReward';

export function useCashRewards() {
  const [rewardState, setRewardState] = useState<CashRewardState>(getCashRewardState);

  // Sync on mount and window focus
  useEffect(() => {
    const sync = () => setRewardState(getCashRewardState());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('focus', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const registerScan = useCallback((scanId?: string) => {
    const result = recordScanMilestone(scanId);
    setRewardState(result.newState);
    return result;
  }, []);

  const withdrawUPI = useCallback((amount: number, upiId: string) => {
    const result = processUPIWithdrawal(amount, upiId);
    if (result.success) {
      setRewardState(result.newState);
    }
    return result;
  }, []);

  return {
    rewardState,
    registerScan,
    withdrawUPI,
  };
}
