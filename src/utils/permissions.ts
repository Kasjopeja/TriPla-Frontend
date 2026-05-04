import { ParticipantRole, type ParticipantDto, type Uuid } from '@/types';

export function getMyRole(
  participants: ParticipantDto[],
  myUserId: Uuid | null,
): ParticipantRole | null {
  if (!myUserId) return null;
  return participants.find((p) => p.userId === myUserId)?.role ?? null;
}

export function canEditTripResources(role: ParticipantRole | null): boolean {
  return role !== null && role >= ParticipantRole.Editor;
}

export function isTripOwner(role: ParticipantRole | null): boolean {
  return role === ParticipantRole.Organizer;
}
