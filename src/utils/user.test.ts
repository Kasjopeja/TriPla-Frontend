import { describe, expect, it } from 'vitest';
import { formatUser, formatUserShort, formatUserWithName } from './user';

describe('formatUser', () => {
  it('prefers email when available', () => {
    expect(formatUser({ email: 'a@b.com', firstName: 'X' })).toBe('a@b.com');
  });

  it('falls back to full name', () => {
    expect(formatUser({ firstName: 'Alice', lastName: 'K' })).toBe('Alice K');
  });

  it('falls back to short id', () => {
    expect(formatUser({ userId: '12345678-aaaa' })).toBe('12345678');
  });

  it('returns "Nieznany" when nothing is provided', () => {
    expect(formatUser({})).toBe('Nieznany');
  });
});

describe('formatUserWithName', () => {
  it('combines name and email when both present', () => {
    expect(
      formatUserWithName({ firstName: 'Alice', lastName: 'K', email: 'a@b.com' }),
    ).toBe('Alice K (a@b.com)');
  });

  it('falls back to formatUser when name missing', () => {
    expect(formatUserWithName({ email: 'a@b.com' })).toBe('a@b.com');
  });
});

describe('formatUserShort', () => {
  it('prefers first name', () => {
    expect(formatUserShort({ firstName: 'Alice', email: 'a@b.com' })).toBe('Alice');
  });

  it('uses email local-part when no first name', () => {
    expect(formatUserShort({ email: 'alice@example.com' })).toBe('alice');
  });

  it('falls back to short id', () => {
    expect(formatUserShort({ userId: 'abcdef12-3456' })).toBe('abcdef12');
  });
});
