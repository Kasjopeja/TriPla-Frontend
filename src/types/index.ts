export type Uuid = string;

export const ParticipantRole = {
  Member: 0,
  Editor: 1,
  Organizer: 2,
} as const;
export type ParticipantRole = (typeof ParticipantRole)[keyof typeof ParticipantRole];

export const ExpenseCategory = {
  Accommodation: 0,
  Transport: 1,
  Food: 2,
  Activities: 3,
  Shopping: 4,
  Other: 5,
} as const;
export type ExpenseCategory = (typeof ExpenseCategory)[keyof typeof ExpenseCategory];

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: Uuid;
  email: string;
  token: string;
}

export interface TripDto {
  id: Uuid;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  ownerId: Uuid;
  participantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantDto {
  id: Uuid;
  userId: Uuid;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: ParticipantRole;
  joinedAt: string;
}

export interface AttractionDto {
  id: Uuid;
  name: string;
  description: string | null;
  street: string | null;
  city: string | null;
  country: string | null;
  plannedAt: string | null;
}

export interface ExpenseSplitDto {
  userId: Uuid;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  amount: number;
  currency: string;
}

export interface ExpenseDto {
  id: Uuid;
  paidByUserId: Uuid;
  payerFirstName: string | null;
  payerLastName: string | null;
  payerEmail: string | null;
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  isSettled: boolean;
  splits: ExpenseSplitDto[];
}

export interface SetSettledRequest {
  isSettled: boolean;
}

export interface CommentDto {
  id: Uuid;
  authorId: Uuid;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorEmail: string | null;
  parentId: Uuid | null;
  content: string;
  createdAt: string;
  editedAt: string | null;
}

export interface TripDetailsDto extends TripDto {
  participants: ParticipantDto[];
  attractions: AttractionDto[];
  expenses: ExpenseDto[];
  comments: CommentDto[];
}

export interface CreateTripRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface UpdateTripRequest {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CreateAttractionRequest {
  name: string;
  description?: string | null;
  plannedAt?: string | null;
  street?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface ExpenseSplitRequest {
  userId: Uuid;
  amount: number;
}

export interface CreateExpenseRequest {
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  splits?: ExpenseSplitRequest[] | null;
}

export interface UpdateExpenseRequest {
  title: string;
  description?: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  splits?: ExpenseSplitRequest[] | null;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: Uuid | null;
}

export interface UpdateCommentRequest {
  content: string;
}

export interface AddParticipantRequest {
  email: string;
  role: ParticipantRole;
}

export interface ChangeRoleRequest {
  role: ParticipantRole;
}

export interface TripChangeLogDto {
  tripId: Uuid;
  type: string;
  actorId: Uuid;
  actorEmail: string | null;
  payloadJson: string | null;
  occurredAt: string;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  error?: string;
}
