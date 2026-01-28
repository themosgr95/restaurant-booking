// src/lib/auth/rbac.ts

export type MembershipRole = "OWNER" | "MANAGER" | "STAFF";

const roleWeight: Record<MembershipRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  STAFF: 1,
};

export function hasRole(
  userRole: MembershipRole | null | undefined,
  required: MembershipRole
) {
  if (!userRole) return false;
  return roleWeight[userRole] >= roleWeight[required];
}
