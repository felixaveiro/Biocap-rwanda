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

export default function UserTable({
  users: teamMembersList,
  currentUser,
  onUserUpdated,
}: UserTableProps) {
  const [activeDeletingUserId, setActiveDeletingUserId] = useState<string | null>(null);
  const [tableActionError, setTableActionError] = useState<string | null>(null);

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

  const getRoleBadgeStyle = (userRole: Role) => {
    switch (userRole) {
      case "admin":
        return "bg-purple-50 text-purple-700 border-purple-200/80";
      case "communication_officer":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/80";
      case "editor":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      case "principal_investigator":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "media_correspondent":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      default:
        return "bg-sky-50 text-sky-700 border-sky-200/80";
    }
  };

  return (
    <div className="w-full">
      {tableActionError && (
        <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {tableActionError}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200/80 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th scope="col" className="px-6 py-4">User Info</th>
              <th scope="col" className="px-6 py-4">Role</th>
              <th scope="col" className="px-6 py-4">Status</th>
              <th scope="col" className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {teamMembersList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400">
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
                  <tr key={memberId} className="transition hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 uppercase">
                          {member.firstName?.[0] || member.username?.[0] || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                            {memberFullName}
                            {isSelfAccount && (
                              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 uppercase">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleBadgeStyle(
                          member.role
                        )}`}
                      >
                        <Shield size={12} />
                        {ROLE_LABELS[member.role] || member.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                        <CheckCircle2 size={14} /> Active
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canModifyRoles && (
                          <button
                            onClick={() => handleOpenEditModal(member)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 shadow-xs transition hover:bg-slate-100 hover:text-slate-800"
                            title="Edit User Role"
                          >
                            <Edit3 size={15} />
                          </button>
                        )}

                        {canDeleteAccounts && !isSelfAccount && (
                          <button
                            disabled={activeDeletingUserId === memberId}
                            onClick={() => handleMemberDelete(memberId, memberFullName)}
                            className="rounded-lg border border-rose-100 p-1.5 text-rose-500 shadow-xs transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                          >
                            {activeDeletingUserId === memberId ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Team Member Account
              </h3>
              <button
                onClick={handleCloseEditModal}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-700">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserModalSubmit} className="space-y-4 pt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-900 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Assigned System Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] || r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isModalSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
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