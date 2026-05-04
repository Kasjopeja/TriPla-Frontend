import { describe, expect, it } from 'vitest';
import {
  canEditTripResources,
  getMyRole,
  isTripOwner,
} from './permissions';
import { ParticipantRole, type ParticipantDto } from '@/types';

const ME = '11111111-1111-1111-1111-111111111111';

function p(userId: string, role: ParticipantRole): ParticipantDto {
  return {
    id: crypto.randomUUID(),
    userId,
    firstName: null,
    lastName: null,
    email: null,
    role,
    joinedAt: '2026-01-01T00:00:00Z',
  };
}

describe('getMyRole', () => {
  it('returns null when userId is null', () => {
    expect(getMyRole([], null)).toBeNull();
  });

  it('returns null when user not in participants', () => {
    expect(getMyRole([p('other', ParticipantRole.Member)], ME)).toBeNull();
  });

  it('returns the user role when present', () => {
    expect(getMyRole([p(ME, ParticipantRole.Editor)], ME)).toBe(ParticipantRole.Editor);
  });
});

describe('canEditTripResources', () => {
  it('allows editor and organizer', () => {
    expect(canEditTripResources(ParticipantRole.Editor)).toBe(true);
    expect(canEditTripResources(ParticipantRole.Organizer)).toBe(true);
  });

  it('rejects member and null', () => {
    expect(canEditTripResources(ParticipantRole.Member)).toBe(false);
    expect(canEditTripResources(null)).toBe(false);
  });
});

describe('isTripOwner', () => {
  it('only matches Organizer role', () => {
    expect(isTripOwner(ParticipantRole.Organizer)).toBe(true);
    expect(isTripOwner(ParticipantRole.Editor)).toBe(false);
    expect(isTripOwner(ParticipantRole.Member)).toBe(false);
    expect(isTripOwner(null)).toBe(false);
  });
});
