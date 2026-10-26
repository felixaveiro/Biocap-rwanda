'use client';

import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { blogsApi } from "@/lib/api/blogs";
import { useSession } from "@/hooks/useSession";
import { ActivityLog, AuditLogFilterOptions } from "@/lib/api/blogs";
import { RefreshCw, Search, Clock, AlertCircle } from "lucide-react";

export default function AdminAuditPage() {
  const { user: currentAdminUser, allowed: isPermissionAllowed } = useSession("user:view");

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [actorFilter, setActorFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchLogs = useCallback(async () => {
    if (!currentAdminUser) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params: AuditLogFilterOptions = {};
      if (actorFilter) params.actor = actorFilter;
      if (actionFilter) params.action = actionFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await blogsApi.getAdminAuditLogs(params);
      // Normalize response
      let extracted: ActivityLog[] = [];
      if (Array.isArray(res)) extracted = res;
      else if (Array.isArray(res?.data)) extracted = res.data;
      else if (Array.isArray(res?.docs)) extracted = res.docs;

      setLogs(extracted);
    } catch (error: unknown) {
      console.error("Failed to load audit logs:", error);
      const msg = error instanceof Error ? error.message : "Failed to fetch audit logs.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [currentAdminUser, actorFilter, actionFilter, fromDate, toDate]);

  useEffect(() => {
    if (currentAdminUser && isPermissionAllowed) fetchLogs();
  }, [currentAdminUser, isPermissionAllowed, fetchLogs]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      <Header title="Platform Audit Logs" subtitle="System-wide activity and change history" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {errorMessage && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600" />
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={fetchLogs}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-xs transition hover:bg-rose-100"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 gap-3">
            <div className="relative min-w-[200px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Actor (username or id)"
                value={actorFilter}
                onChange={(e) => setActorFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 pl-9 text-sm focus:border-indigo-500"
              />
            </div>

            <input
              type="text"
              placeholder="Action (e.g. blog:update, user:deactivate)"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-sm"
            />

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-slate-200 p-2.5 text-sm"
            />

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-slate-200 p-2.5 text-sm"
            />

            <button
              onClick={fetchLogs}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Clock size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 rounded bg-slate-100" />
              <div className="h-6 rounded bg-slate-100" />
              <div className="h-6 rounded bg-slate-100" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-400">No audit entries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200/80 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {logs.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-xs text-slate-500">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {typeof l.user === 'string' ? l.user : `${l.user?.firstName || ''} ${l.user?.lastName || ''} ${l.user?.username ? `(${l.user.username})` : ''}`}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{l.action}</td>
                      <td className="px-4 py-3">{l.resource || l.resourceId || '-'}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{l.details || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
