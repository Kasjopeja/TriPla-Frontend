export const typeLabel: Record<string, string> = {
  TripCreated: 'Utworzono wycieczkę',
  TripUpdated: 'Zaktualizowano wycieczkę',
  TripDeleted: 'Usunięto wycieczkę',
  ParticipantInvited: 'Zaproszono uczestnika',
  ParticipantRemoved: 'Usunięto uczestnika',
  ParticipantLeft: 'Uczestnik opuścił wycieczkę',
  RoleChanged: 'Zmieniono rolę',
  AttractionAdded: 'Dodano atrakcję',
  AttractionUpdated: 'Zaktualizowano atrakcję',
  AttractionDeleted: 'Usunięto atrakcję',
  ExpenseAdded: 'Dodano wydatek',
  ExpenseUpdated: 'Zaktualizowano wydatek',
  ExpenseDeleted: 'Usunięto wydatek',
  ExpenseSettled: 'Oznaczono wydatek jako rozliczony',
  ExpenseUnsettled: 'Cofnięto rozliczenie wydatku',
  AllExpensesSettled: 'Rozliczono wszystkie wydatki',
  AllExpensesUnsettled: 'Cofnięto rozliczenie wszystkich wydatków',
  CommentAdded: 'Dodano komentarz',
  CommentReplied: 'Dodano odpowiedź',
  CommentUpdated: 'Edytowano komentarz',
  CommentDeleted: 'Usunięto komentarz',
};

export function labelFor(type: string): string {
  return typeLabel[type] ?? type;
}
