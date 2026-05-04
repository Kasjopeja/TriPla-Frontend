import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettlementSummary } from './SettlementSummary';
import {
  ExpenseCategory,
  ParticipantRole,
  type ExpenseDto,
  type ParticipantDto,
} from '@/types';

const ALICE = '11111111-1111-1111-1111-111111111111';
const BOB = '22222222-2222-2222-2222-222222222222';

function participant(userId: string, firstName: string): ParticipantDto {
  return {
    id: crypto.randomUUID(),
    userId,
    firstName,
    lastName: null,
    email: `${firstName.toLowerCase()}@example.com`,
    role: ParticipantRole.Member,
    joinedAt: '2026-01-01T00:00:00Z',
  };
}

function expense(
  paidBy: string,
  amount: number,
  splits: { userId: string; amount: number }[],
  isSettled = false,
): ExpenseDto {
  return {
    id: crypto.randomUUID(),
    paidByUserId: paidBy,
    payerFirstName: null,
    payerLastName: null,
    payerEmail: null,
    title: 'Hotel',
    description: null,
    amount,
    currency: 'PLN',
    category: ExpenseCategory.Other,
    date: '2026-01-01T00:00:00Z',
    isSettled,
    splits: splits.map((s) => ({
      userId: s.userId,
      firstName: null,
      lastName: null,
      email: null,
      amount: s.amount,
      currency: 'PLN',
    })),
  };
}

describe('SettlementSummary', () => {
  it('shows the all-clear message when there are no transfers', () => {
    render(<SettlementSummary expenses={[]} participants={[]} />);

    expect(screen.getByText(/wszystko się zgadza/i)).toBeInTheDocument();
  });

  it('renders a single transfer with names from participants', () => {
    const participants = [participant(ALICE, 'Alice'), participant(BOB, 'Bob')];
    const expenses = [
      expense(ALICE, 100, [
        { userId: ALICE, amount: 50 },
        { userId: BOB, amount: 50 },
      ]),
    ];

    render(<SettlementSummary expenses={expenses} participants={participants} />);

    expect(screen.getByText(/1 przelew/i)).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('50.00 PLN')).toBeInTheDocument();
  });

  it('ignores settled expenses when computing transfers', () => {
    const participants = [participant(ALICE, 'Alice'), participant(BOB, 'Bob')];
    const expenses = [
      expense(
        ALICE,
        100,
        [
          { userId: ALICE, amount: 50 },
          { userId: BOB, amount: 50 },
        ],
        true,
      ),
    ];

    render(<SettlementSummary expenses={expenses} participants={participants} />);

    expect(screen.getByText(/wszystko się zgadza/i)).toBeInTheDocument();
  });
});
