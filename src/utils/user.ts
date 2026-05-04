interface UserLike {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  userId?: string;
}

export function formatUser(u: UserLike): string {
  if (u.email) return u.email;
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  if (name) return name;
  return u.userId ? u.userId.slice(0, 8) : 'Nieznany';
}

export function formatUserWithName(u: UserLike): string {
  const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  if (name && u.email) return `${name} (${u.email})`;
  return formatUser(u);
}

export function formatUserShort(u: UserLike): string {
  if (u.firstName) return u.firstName;
  if (u.email) return u.email.split('@')[0];
  return u.userId ? u.userId.slice(0, 8) : 'Nieznany';
}
