export function isOwner(role) {
  return role === "owner";
}

export function isAdmin(role) {
  return role === "admin";
}

export function isOwnerOrAdmin(role) {
  return role === "owner" || role === "admin";
}