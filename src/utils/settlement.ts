import type { ExpenseDto, ParticipantDto, Uuid } from '@/types';

export interface Transfer {
  from: Uuid;
  to: Uuid;
  amount: number;
  currency: string;
}

const EPSILON = 0.005;

export function computeSettlements(expenses: ExpenseDto[]): Transfer[] {
  const balancesByCurrency = new Map<string, Map<Uuid, number>>();

  for (const e of expenses) {
    if (e.isSettled) continue;
    if (e.splits.length === 0) continue;
    let bal = balancesByCurrency.get(e.currency);
    if (!bal) {
      bal = new Map();
      balancesByCurrency.set(e.currency, bal);
    }
    bal.set(e.paidByUserId, (bal.get(e.paidByUserId) ?? 0) + e.amount);
    for (const s of e.splits) {
      bal.set(s.userId, (bal.get(s.userId) ?? 0) - s.amount);
    }
  }

  const transfers: Transfer[] = [];

  for (const [currency, balMap] of balancesByCurrency) {
    const creditors = [...balMap.entries()]
      .filter(([, b]) => b > EPSILON)
      .sort((a, b) => b[1] - a[1])
      .map(([uid, amt]) => ({ uid, amt }));
    const debtors = [...balMap.entries()]
      .filter(([, b]) => b < -EPSILON)
      .sort((a, b) => a[1] - b[1])
      .map(([uid, amt]) => ({ uid, amt }));

    let i = 0;
    let j = 0;
    while (i < creditors.length && j < debtors.length) {
      const pay = Math.min(creditors[i].amt, -debtors[j].amt);
      transfers.push({
        from: debtors[j].uid,
        to: creditors[i].uid,
        amount: Math.round(pay * 100) / 100,
        currency,
      });
      creditors[i].amt -= pay;
      debtors[j].amt += pay;
      if (creditors[i].amt < EPSILON) i++;
      if (debtors[j].amt > -EPSILON) j++;
    }
  }

  return transfers;
}

export function splitsAreEqual(
  amounts: number[],
  expectedPerPerson?: number,
): boolean {
  if (amounts.length === 0) return false;
  if (expectedPerPerson !== undefined) {
    return amounts.every((a) => Math.abs(a - expectedPerPerson) < EPSILON);
  }
  // Bez wartości referencyjnej akceptujemy drobny drift z zaokrąglania (do 1 grosza),
  // żeby [33.33, 33.33, 33.34] traktować jako równy podział.
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  return max - min <= 0.011;
}

export function participantUser(
  userId: Uuid,
  participants: ParticipantDto[],
): ParticipantDto | undefined {
  return participants.find((p) => p.userId === userId);
}

export function equalSplitAmounts(total: number, count: number): number[] {
  if (count <= 0) return [];
  const perPerson = Math.floor((total * 100) / count) / 100;
  const driftCents = Math.round((total - perPerson * count) * 100);
  const result = new Array(count).fill(perPerson);
  for (let i = 0; i < driftCents; i++) {
    result[i] = Math.round((result[i] + 0.01) * 100) / 100;
  }
  return result;
}
