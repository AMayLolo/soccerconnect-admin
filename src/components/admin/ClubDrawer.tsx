"use client";

import { useEffect, useState } from "react";

// This mirrors the type we export from the page
export type ClubRecord = {
  id?: string;
  club_name: string;
  city: string;
  state: string;
  website: string;
  is_active: boolean;

  claim_status: string;
  claimed_by_user_id: string;
  contact_email: string;
  contact_phone: string;
};

export default function ClubDrawer({
  open,
  busy,
  club,
  onClose,
  onSave,
}: {
  open: boolean;
  busy: boolean;
  club: ClubRecord;
  onClose: () => void;
  onSave: (updated: ClubRecord) => void;
}) {
  const [form, setForm] = useState<ClubRecord>(club);

  // sync when parent changes (edit vs new)
  useEffect(() => {
    setForm(club);
  }, [club]);

  // lock scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const backdropClasses = open
    ? "opacity-100 pointer-events-auto"
    : "opacity-0 pointer-events-none";

  const panelClasses = open ? "translate-x-0" : "translate-x-full";

  function handleChange<K extends keyof ClubRecord>(
    key: K,
    value: ClubRecord[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity duration-200 ${backdropClasses}`}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={`fixed right-0 top-0 z-[101] h-full w-full max-w-md transform border-l border-neutral-200 bg-white shadow-xl transition-transform duration-300 dark:border-neutral-700 dark:bg-neutral-900 ${panelClasses}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-700">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {form.id ? "Edit Club" : "New Club"}
              </h2>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400 break-all">
                {form.id ? form.id : "Create a new club record"}
              </p>
            </div>

            <button
              onClick={onClose}
              className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[12px] font-medium text-neutral-700 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-blue-400"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 text-sm text-neutral-800 dark:text-neutral-200">
            <div className="space-y-6">
              {/* Club Name */}
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                  Club Name
                </label>
                <input
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  value={form.club_name}
                  onChange={(e) => handleChange("club_name", e.target.value)}
                  placeholder="Ex: Chicago Rush"
                />
              </div>

              {/* City / State */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    City
                  </label>
                  <input
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    placeholder="Ex: Austin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    State
                  </label>
                  <input
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    placeholder="Ex: TX"
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                  Website
                </label>
                <input
                  className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              {/* Contact email / phone */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    Contact Email
                  </label>
                  <input
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.contact_email}
                    onChange={(e) =>
                      handleChange("contact_email", e.target.value)
                    }
                    placeholder="director@club.org"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    Contact Phone
                  </label>
                  <input
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.contact_phone}
                    onChange={(e) =>
                      handleChange("contact_phone", e.target.value)
                    }
                    placeholder="555-123-4567"
                  />
                </div>
              </div>

              {/* Claim section */}
              <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/40">
                <div className="text-[12px] font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                  Ownership / Claim
                </div>

                {/* Claim Status */}
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    Claim Status
                  </label>
                  <select
                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.claim_status}
                    onChange={(e) =>
                      handleChange("claim_status", e.target.value)
                    }
                  >
                    <option value="unclaimed">Unclaimed</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                    “Pending” means a director requested control. “Approved”
                    means they own this listing.
                  </p>
                </div>

                {/* Claimed by */}
                <div className="space-y-2">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    Claimed By (User ID)
                  </label>
                  <input
                    className="w-full break-all rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    value={form.claimed_by_user_id}
                    onChange={(e) =>
                      handleChange("claimed_by_user_id", e.target.value)
                    }
                    placeholder="user uuid who controls this club"
                  />
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                    Later, this user will get access to a limited “club admin”
                    view.
                  </p>
                </div>
              </div>

              {/* Active toggle */}
              <div className="space-y-2">
                <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                  Public Status
                </label>

                <label className="flex w-fit cursor-pointer select-none items-center gap-2 text-[13px] font-medium text-neutral-800 dark:text-neutral-200">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-blue-500"
                    checked={form.is_active}
                    onChange={(e) =>
                      handleChange("is_active", e.target.checked)
                    }
                  />
                  {form.is_active ? "Active (searchable)" : "Inactive (hidden)"}
                </label>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-500">
                  Inactive clubs will not appear in user search results.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-[11px] text-neutral-500 dark:border-neutral-700 dark:text-neutral-500">
            <button
              onClick={onClose}
              disabled={busy}
              className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 hover:border-neutral-400 hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              Cancel
            </button>

            <button
              onClick={() => onSave(form)}
              disabled={busy || !form.club_name.trim()}
              className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-blue-500 hover:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {form.id ? "Save Changes" : "Create Club"}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
