export interface CashRewardTransaction {
  id: string;
  timestamp: number;
  type: 'reward' | 'withdrawal';
  amount: number;
  description: string;
  upiId?: string;
}

export interface CashRewardState {
  scanCount: number; // total milestone eligible scans
  milestoneCount: number; // 0 to 4 (current position in 5-scan milestone)
  cashBalance: number; // total accumulated reward cash balance in ₹
  totalEarned: number; // lifetime ₹ earned
  milestoneGoal: number; // 5
  rewardAmount: number; // ₹2
  lastRewardedScanId?: string;
  transactions: CashRewardTransaction[];
}

const CASH_REWARD_KEY = 'w2w_cash_rewards_v1';

export const DEFAULT_CASH_REWARD_STATE: CashRewardState = {
  scanCount: 0,
  milestoneCount: 0,
  cashBalance: 0,
  totalEarned: 0,
  milestoneGoal: 5,
  rewardAmount: 2,
  transactions: [],
};

export function getCashRewardState(): CashRewardState {
  try {
    const data = localStorage.getItem(CASH_REWARD_KEY);
    if (!data) return DEFAULT_CASH_REWARD_STATE;
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_CASH_REWARD_STATE,
      ...parsed,
      milestoneGoal: 5,
      rewardAmount: 2,
    };
  } catch (err) {
    console.error('Error reading cash reward state:', err);
    return DEFAULT_CASH_REWARD_STATE;
  }
}

export function saveCashRewardState(state: CashRewardState): void {
  try {
    localStorage.setItem(CASH_REWARD_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving cash reward state:', err);
  }
}

/**
 * Register a scan for milestone reward progress.
 * If this reaches a 5-scan milestone, unlocks ₹2 cash reward!
 */
export function recordScanMilestone(scanId?: string): {
  newState: CashRewardState;
  unlockedReward: boolean;
  rewardAmount: number;
} {
  const current = getCashRewardState();

  // Prevent double counting the same scan ID if provided
  if (scanId && current.lastRewardedScanId === scanId) {
    return {
      newState: current,
      unlockedReward: false,
      rewardAmount: 0,
    };
  }

  const nextScanCount = current.scanCount + 1;
  const nextMilestoneCount = (current.milestoneCount + 1) % 5;
  const unlockedReward = (current.milestoneCount + 1) === 5;
  const earnedAmount = unlockedReward ? current.rewardAmount : 0;

  const newBalance = current.cashBalance + earnedAmount;
  const newTotalEarned = current.totalEarned + earnedAmount;

  const newTransactions = unlockedReward
    ? [
        {
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          timestamp: Date.now(),
          type: 'reward' as const,
          amount: earnedAmount,
          description: `Completed 5-Scan Milestone #${Math.floor(nextScanCount / 5)}`,
        },
        ...current.transactions,
      ]
    : current.transactions;

  const newState: CashRewardState = {
    ...current,
    scanCount: nextScanCount,
    milestoneCount: nextMilestoneCount,
    cashBalance: newBalance,
    totalEarned: newTotalEarned,
    lastRewardedScanId: scanId || current.lastRewardedScanId,
    transactions: newTransactions.slice(0, 50),
  };

  saveCashRewardState(newState);

  return {
    newState,
    unlockedReward,
    rewardAmount: earnedAmount,
  };
}

/**
 * Process a UPI withdrawal from cash balance.
 */
export function processUPIWithdrawal(amount: number, upiId: string): {
  success: boolean;
  message: string;
  newState: CashRewardState;
} {
  const current = getCashRewardState();

  if (amount <= 0) {
    return { success: false, message: 'Invalid withdrawal amount', newState: current };
  }

  if (amount > current.cashBalance) {
    return { success: false, message: 'Insufficient cash balance', newState: current };
  }

  if (!upiId || !upiId.includes('@')) {
    return { success: false, message: 'Please enter a valid UPI ID (e.g. user@upi)', newState: current };
  }

  const tx: CashRewardTransaction = {
    id: `wth_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: Date.now(),
    type: 'withdrawal',
    amount,
    description: `UPI Withdrawal to ${upiId}`,
    upiId,
  };

  const newState: CashRewardState = {
    ...current,
    cashBalance: current.cashBalance - amount,
    transactions: [tx, ...current.transactions],
  };

  saveCashRewardState(newState);

  return {
    success: true,
    message: `₹${amount} successfully transferred to ${upiId}!`,
    newState,
  };
}
