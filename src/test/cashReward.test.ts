import { describe, it, expect, beforeEach } from "vitest";
import {
  getCashRewardState,
  saveCashRewardState,
  recordScanMilestone,
  processUPIWithdrawal,
  DEFAULT_CASH_REWARD_STATE,
} from "@/lib/cashReward";

describe("W2W Cash Rewards & Milestones", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with default reward state", () => {
    const state = getCashRewardState();
    expect(state.cashBalance).toBe(0);
    expect(state.milestoneCount).toBe(0);
    expect(state.scanCount).toBe(0);
  });

  it("advances milestone count for scans without premature reward", () => {
    const res = recordScanMilestone("scan_1");
    expect(res.newState.scanCount).toBe(1);
    expect(res.newState.milestoneCount).toBe(1);
    expect(res.unlockedReward).toBe(false);
    expect(res.newState.cashBalance).toBe(0);
  });

  it("unlocks ₹2 reward upon reaching 5th scan milestone", () => {
    recordScanMilestone("scan_1");
    recordScanMilestone("scan_2");
    recordScanMilestone("scan_3");
    recordScanMilestone("scan_4");
    const res5 = recordScanMilestone("scan_5");

    expect(res5.unlockedReward).toBe(true);
    expect(res5.rewardAmount).toBe(2);
    expect(res5.newState.cashBalance).toBe(2);
    expect(res5.newState.milestoneCount).toBe(0); // Resets cycle to 0
    expect(res5.newState.transactions.length).toBeGreaterThan(0);
  });

  it("prevents double counting the same scan ID", () => {
    recordScanMilestone("scan_duplicate");
    const dupRes = recordScanMilestone("scan_duplicate");
    expect(dupRes.newState.scanCount).toBe(1);
    expect(dupRes.unlockedReward).toBe(false);
  });

  it("handles UPI withdrawal validation and balances", () => {
    // Manually credit ₹10
    saveCashRewardState({
      ...DEFAULT_CASH_REWARD_STATE,
      cashBalance: 10,
    });

    // Invalid UPI
    const failUpi = processUPIWithdrawal(5, "invalid-upi");
    expect(failUpi.success).toBe(false);

    // Insufficient balance
    const failAmt = processUPIWithdrawal(20, "user@okhdfcbank");
    expect(failAmt.success).toBe(false);

    // Valid withdrawal
    const success = processUPIWithdrawal(5, "user@okhdfcbank");
    expect(success.success).toBe(true);
    expect(success.newState.cashBalance).toBe(5);
  });
});
