import { MembershipRole } from "@prisma/client";

const roleRank: Record<MembershipRole, number> = {
  OWNER: 3,
  MANAGER: 2,
  STAFF: 1,
};

export function hasAtLeastRole(userRole: MembershipRole, minimumRole: MembershipRole) {
  return roleRank[userRole] >= roleRank[minimumRole];
}

export function canManageSettings(role: MembershipRole) {
  return hasAtLeastRole(role, "OWNER");
}

export function canManageRestaurant(role: MembershipRole) {
  return hasAtLeastRole(role, "MANAGER");
}

export function canWorkBookings(role: MembershipRole) {
  return hasAtLeastRole(role, "STAFF");
}
