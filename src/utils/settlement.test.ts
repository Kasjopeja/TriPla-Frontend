import { describe, expect, it } from 'vitest';
import {
  computeSettlements,
  equalSplitAmounts,
  splitsAreEqual,
} from './settlement';
import { ExpenseCategory, type ExpenseDto } from '@/types';

const ALICE = '11111111-1111-1111-1111-111111111111';
const BOB = '22222222-2222-2222-2222-222222222222';
const CAROL = '33333333-3333-3333-3333-333333333333';

function expense(
  paidBy: string,
  amount: number,
  splits: { userId: string; amount: number }[],
  opts: { isSettled?: boolean; currency?: string } = {},
): ExpenseDto {
  return {
    id: crypto.randomUUID(),
    paidByUserId: paidBy,
    payerFirstName: null,
    payerLastName: null,
    payerEmail: null,
    title: 't',
    description: null,
    amount,
    currency: opts.currency ?? 'PLN',
    category: ExpenseCategory.Other,
    date: '2026-01-01T00:00:00Z',
    isSettled: opts.isSettled ?? false,
    splits: splits.map((s) => ({
      userId: s.userId,
      firstName: null,
      lastName: null,
      email: null,
      amount: s.amount,
      currency: opts.currency ?? 'PLN',
    })),
  };
}

describe('equalSplitAmounts', () => {
  it('handles even division', () => {
    expect(equalSplitAmounts(100, 4)).toEqual([25, 25, 25, 25]);
  });

  it('distributes drift across the first cents', () => {
    expect(equalSplitAmounts(100, 3)).toEqual([33.34, 33.33, 33.33]);
  });

  it('returns empty array for zero count', () => {
    expect(equalSplitAmounts(100, 0)).toEqual([]);
  });

  it('sums back to the original total', () => {
    const result = equalSplitAmounts(123.45, 7);
    const sum = result.reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - 123.45)).toBeLessThan(0.001);
  });
});

describe('splitsAreEqual', () => {
  it('detects equal amounts within epsilon', () => {
    expect(splitsAreEqual([33.33, 33.33, 33.34])).toBe(true);
  });

  it('rejects clearly different amounts', () => {
    expect(splitsAreEqual([10, 20])).toBe(false);
  });

  it('returns false for empty', () => {
    expect(splitsAreEqual([])).toBe(false);
  });
});

describe('computeSettlements', () => {
  it('produces no transfers when nothing to settle', () => {
    expect(computeSettlements([])).toEqual([]);
  });

  it('skips expenses without splits (treated as personal)', () => {
    expect(computeSettlements([expense(ALICE, 100, [])])).toEqual([]);
  });

  it('skips already-settled expenses', () => {
    const e = expense(
      ALICE,
      100,
      [
        { userId: ALICE, amount: 50 },
        { userId: BOB, amount: 50 },
      ],
      { isSettled: true },
    );
    expect(computeSettlements([e])).toEqual([]);
  });

  it('computes a single transfer for two users', () => {
    const e = expense(ALICE, 100, [
      { userId: ALICE, amount: 50 },
      { userId: BOB, amount: 50 },
    ]);
    const transfers = computeSettlements([e]);
    expect(transfers).toEqual([
      { from: BOB, to: ALICE, amount: 50, currency: 'PLN' },
    ]);
  });

  it('cancels out mutual debts', () => {
    const e1 = expense(ALICE, 90, [
      { userId: ALICE, amount: 30 },
      { userId: BOB, amount: 30 },
      { userId: CAROL, amount: 30 },
    ]);
    const e2 = expense(BOB, 60, [
      { userId: ALICE, amount: 20 },
      { userId: BOB, amount: 20 },
      { userId: CAROL, amount: 20 },
    ]);

    const transfers = computeSettlements([e1, e2]);

    // Net balances: Alice +60-20 = +40, Bob -30+40 = +10, Carol -30-20 = -50
    // Carol should owe Alice 40 and Bob 10.
    expect(transfers).toHaveLength(2);
    const alicePayment = transfers.find((t) => t.to === ALICE);
    const bobPayment = transfers.find((t) => t.to === BOB);
    expect(alicePayment).toMatchObject({ from: CAROL, amount: 40 });
    expect(bobPayment).toMatchObject({ from: CAROL, amount: 10 });
  });

  it('groups transfers by currency', () => {
    const pln = expense(ALICE, 100, [
      { userId: ALICE, amount: 50 },
      { userId: BOB, amount: 50 },
    ]);
    const eur = expense(
      BOB,
      40,
      [
        { userId: ALICE, amount: 20 },
        { userId: BOB, amount: 20 },
      ],
      { currency: 'EUR' },
    );

    const transfers = computeSettlements([pln, eur]);

    expect(transfers).toHaveLength(2);
    expect(transfers.map((t) => t.currency).sort()).toEqual(['EUR', 'PLN']);
  });
});
