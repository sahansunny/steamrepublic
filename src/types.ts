export interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  barcode?: string;
  coins: number;
  visits: number;
  streak: number;
  history: Transaction[];
  createdAt: string;
  lastClaimDate?: string;
  claimsToday?: number;
}

export interface Transaction {
  coins: number;
  reason: string;
  date: string;
  code?: string;
}

export interface Reward {
  name: string;
  cost: number;
  icon: string;
}

export interface CitizenLevel {
  name: string;
  minCoins: number;
  color: string;
}

export interface PurchaseCode {
  code: string;
  coins: number;
  used: boolean;
  usedBy?: string;
  usedAt?: string;
  createdAt: string;
}

export interface RedemptionVoucher {
  id: string;
  userId: string;
  userName: string;
  rewardName: string;
  cost: number;
  voucherCode: string;
  status: 'pending' | 'fulfilled' | 'expired';
  createdAt: string;
  fulfilledAt?: string;
  fulfilledBy?: string;
  expiresAt: string;
}
