'use client';

import { useState } from "react";
import { User, Role, ROLES, ROLE_LABELS } from "@/types";
import { can } from "@/lib/permissions";
import { usersApi } from "@/lib/api/users";
import {
  Shield,
  Edit3,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Save,
  AlertCircle,
} from "lucide-react";

interface UserTableProps {
  users: User[];
  currentUser: User;
  onUserUpdated?: () => void;
}

// ── Same editorial system as Header / Overview / BlogTable / Trash:
// canvas #FAF9F5 · ink #1E2620 · moss #3F6B4F · gold #A9812F · clay #B65C4B · line #E2DDCF
const displayFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
const monoFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function UserTable({
  users: teamMembersList,
  currentUser,
  onUserUpdated,
}: UserTableProps) {
  const [activeDeletingUserId, setActiveDeletingUserId] = useState<string | null>(null);
  const [tableActionError, setTableActionError] = useState<string | null>(null);
  const [tableActionSuccess, setTableActionSuccess] = useState<string | null>(null);
  const [activeResettingUserId, setActiveResettingUserId] = useState<string | null>(null);

  // Modal State
  const [selectedMemberToEdit, setSelectedMemberToEdit] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<Role>("media_correspondent");
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleOpenEditModal = (member: User) => {
    setSelectedMemberToEdit(member);
    setEditFirstName(member.firstName || "");
    setEditLastName(member.lastName || "");
    setEditEmail(member.email || "");
    setEditRole(member.role);
    setModalError(null);
  };

  const handleCloseEditModal = () => {
    setSelectedMemberToEdit(null);
    setModalError(null);
  };

  const handleSaveUserModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberToEdit) return;

    const targetUserId = selectedMemberToEdit._id;
    setIsModalSubmitting(true);
    setModalError(null);

    try {
      // 1. Update basic profile details
      await usersApi.updateUser(targetUserId, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        role: editRole,
      });

      // 2. Change user role if role was modified
      if (editRole !== selectedMemberToEdit.role) {
        await usersApi.changeUserRole(targetUserId, editRole);
      }

      handleCloseEditModal();
      if (onUserUpdated) {
        onUserUpdated();
      } else {
        window.location.reload();
      }
    } catch (error: unknown) {
      console.error("Failed to update team member:", error);
      const msg = error instanceof Error ? error.message : "Failed to update member details.";
      setModalError(msg);
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const handleMemberDelete = async (targetUserId: string, targetMemberName: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete account: ${targetMemberName}?`
    );
    if (!isConfirmed) return;

    setActiveDeletingUserId(targetUserId);
    setTableActionError(null);

    try {
      // Pass ONLY the targetUserId parameter
      await usersApi.deleteUser(targetUserId);
      if (onUserUpdated) onUserUpdated();
      else window.location.reload();
    } catch (error: unknown) {
      console.error("Failed to delete user account:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user account.";
      setTableActionError(errorMessage);
    } finally {
      setActiveDeletingUserId(null);
    }
  };

  const handleResetPassword = async (targetUserId: string, targetMemberName: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to trigger a password reset email for: ${targetMemberName}?`
    );
    if (!isConfirmed) return;

    setActiveResettingUserId(targetUserId);
    setTableActionError(null);
    setTableActionSuccess(null);

    try {
      await usersApi.resetUserPassword(targetUserId);
      setTableActionSuccess("Password reset triggered successfully.");
      if (onUserUpdated) onUserUpdated();
      else window.location.reload();
      // Clear success message after a short delay
      setTimeout(() => setTableActionSuccess(null), 5000);
    } catch (error: unknown) {
      console.error("Failed to trigger password reset:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to trigger password reset.";
      setTableActionError(errorMessage);
    } finally {
      setActiveResettingUserId(null);
    }
  };

  // Role badges now speak in the same restrained ink/moss/gold/clay
  // vocabulary as the rest of the app, rather than a rainbow of
  // unrelated tailwind hues — each color still maps consistently
  // to a role, but reads as one deliberate palette.
  const getRoleBadgeStyle = (userRole: Role) => {
    switch (userRole) {
      case "admin":
        return "border-[#1E2620]/25 bg-[#1E2620]/[0.06] text-[#1E2620]";
      case "communication_officer":
        return "border-[#3F6B4F]/30 bg-[#3F6B4F]/10 text-[#2C4B38]";
      case "editor":
        return "border-[#A9812F]/30 bg-[#A9812F]/10 text-[#7A5D22]";
      case "principal_investigator":
        return "border-[#3F6B4F]/30 bg-[#3F6B4F]/10 text-[#2C4B38]";
      case "media_correspondent":
        return "border-[#B65C4B]/30 bg-[#B65C4B]/10 text-[#8B4136]";
      default:
        return "border-[#8B9188]/30 bg-[#8B9188]/10 text-[#5C6259]";
    }
  };

  return (
    <div className="w-full border border-[#E2DDCF] bg-white">
      {tableActionError && (
        <div className="m-4 flex items-center gap-2.5 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-3 text-xs font-medium text-[#8B4136]">
          <AlertCircle size={14} className="shrink-0" />
          {tableActionError}
        </div>
      )}
      {tableActionSuccess && (
        <div className="m-4 flex items-center gap-2.5 border border-[#3F6B4F]/40 bg-[#3F6B4F]/10 p-3 text-xs font-medium text-[#2C4B38]">
          <CheckCircle2 size={14} className="shrink-0" />
          {tableActionSuccess}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#3A4239]">
          <thead className="border-b border-[#E2DDCF] bg-[#FAF9F5]">
            <tr>
              <th
                scope="col"
                className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]"
                style={monoFont}
              >
                User Info
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]"
                style={monoFont}
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]"
                style={monoFont}
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]"
                style={monoFont}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDEAE0]">
            {teamMembersList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-sm text-[#8B9188]">
                  No team members match the specified criteria.
                </td>
              </tr>
            ) : (
              teamMembersList.map((member) => {
                const memberId = member._id;
                const memberFullName =
                  `${member.firstName || ""} ${member.lastName || ""}`.trim() || member.username;
                const isSelfAccount = currentUser._id === memberId;
                const canModifyRoles = can(currentUser.role, "user:edit:role");
                const canDeleteAccounts = can(currentUser.role, "user:delete");

                return (
                  <tr key={memberId} className="transition hover:bg-[#FAF9F5]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center border border-[#E2DDCF] bg-[#FAF9F5] text-xs font-semibold uppercase text-[#5C6259]"
                          style={displayFont}
                        >
                          {member.firstName?.[0] || member.username?.[0] || "U"}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 font-semibold text-[#1E2620]">
                            {memberFullName}
                            {isSelfAccount && (
                              <span
                                className="border border-[#3F6B4F]/30 bg-[#3F6B4F]/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#2C4B38]"
                                style={monoFont}
                              >
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#8B9188]">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getRoleBadgeStyle(
                          member.role
                        )}`}
                      >
                        <Shield size={11} />
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3F6B4F]">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canModifyRoles && (
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="border border-[#D9D4C6] p-1.5 text-[#7A8079] transition hover:border-[#1E2620] hover:text-[#1E2620]"
                            title="Edit User Role"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}

                        {can(currentUser.role, "user:deactivate") && !isSelfAccount && (
                          <button
                            disabled={activeResettingUserId === memberId}
                            onClick={() => handleResetPassword(memberId, memberFullName)}
                            className="border border-[#D9D4C6] p-1.5 text-[#7A8079] transition hover:border-[#A9812F] hover:text-[#A9812F] disabled:opacity-50"
                            title="Reset Password"
                          >
                            {activeResettingUserId === memberId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Shield size={14} />
                            )}
                          </button>
                        )}

                        {canDeleteAccounts && !isSelfAccount && (
                          <button
                            disabled={activeDeletingUserId === memberId}
                            onClick={() => handleMemberDelete(memberId, memberFullName)}
                            className="border border-[#B65C4B]/30 p-1.5 text-[#B65C4B] transition hover:border-[#B65C4B] hover:bg-[#B65C4B] hover:text-white disabled:opacity-50"
                            title="Delete Account"
                          >
                            {activeDeletingUserId === memberId ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT USER MODAL OVERLAY */}
      {selectedMemberToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E2620]/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg border border-[#E2DDCF] bg-white p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EDEAE0] pb-4">
              <div>
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B9188]"
                  style={monoFont}
                >
                  Edit Member
                </p>
                <h3 className="mt-1 text-lg italic text-[#1E2620]" style={displayFont}>
                  {`${editFirstName || selectedMemberToEdit.firstName || ""} ${
                    editLastName || selectedMemberToEdit.lastName || ""
                  }`.trim() || selectedMemberToEdit.username}
                </h3>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="p-1 text-[#8B9188] transition hover:text-[#1E2620]"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2 border border-[#B65C4B]/40 bg-[#B65C4B]/10 p-3 text-xs font-medium text-[#8B4136]">
                <AlertCircle size={15} className="shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserModalSubmit} className="space-y-4 pt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full border border-[#D9D4C6] bg-[#FAF9F5]/40 p-2.5 text-sm font-medium text-[#1E2620] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
                  />
                </div>

                <div>
                  <label
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full border border-[#D9D4C6] bg-[#FAF9F5]/40 p-2.5 text-sm font-medium text-[#1E2620] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
                  />
                </div>
              </div>

              <div>
                <label
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-[#D9D4C6] bg-[#FAF9F5]/40 p-2.5 text-sm font-medium text-[#1E2620] transition focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8B9188]"
                >
                  Assigned System Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full appearance-none border border-[#D9D4C6] bg-[#FAF9F5]/40 p-2.5 text-sm font-medium text-[#3A4239] transition cursor-pointer focus:border-[#3F6B4F] focus:outline-none focus:ring-4 focus:ring-[#3F6B4F]/10"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-[#EDEAE0] pt-5">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="border border-[#D9D4C6] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5C6259] transition hover:border-[#1E2620] hover:text-[#1E2620]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="inline-flex items-center gap-2 border border-[#3F6B4F]/40 bg-[#3F6B4F] px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white transition hover:bg-[#2C4B38] hover:border-[#2C4B38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isModalSubmitting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}