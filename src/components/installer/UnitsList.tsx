"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface Unit {
  id: string;
  name: string;
  address: string | null;
  createdAt: string;
  _count: { records: number };
}

interface Props {
  units: Unit[];
}

export default function UnitsList({ units: initialUnits }: Props) {
  const [units, setUnits] = useState(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const filtered = units.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.address ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), address: newAddress.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? "Fejl ved oprettelse");
        return;
      }

      const newUnit: Unit = { ...data, _count: { records: 0 } };
      setUnits((prev) => [newUnit, ...prev]);
      setNewName("");
      setNewAddress("");
      setShowCreateForm(false);
    } catch {
      setCreateError("Netværksfejl – prøv igen");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Enheder</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {units.length} {units.length === 1 ? "enhed" : "enheder"} i alt
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Opret ny enhed
        </button>
      </div>

      {/* Create form */}
      {showCreateForm && (
        <div className="card p-5 mb-5 border-primary-200">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">
            Opret ny enhed
          </h2>
          {createError && (
            <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">
                Navn / Adresse <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input"
                placeholder="f.eks. Villavejen 12"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                minLength={2}
                disabled={creating}
              />
            </div>
            <div>
              <label className="label">Fuld adresse (valgfri)</label>
              <input
                type="text"
                className="input"
                placeholder="f.eks. Villavejen 12, 2800 Kongens Lyngby"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                disabled={creating}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? "Opretter..." : "Opret enhed"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setCreateError("");
                  setNewName("");
                  setNewAddress("");
                }}
                className="btn-secondary"
                disabled={creating}
              >
                Annuller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      {units.length > 5 && (
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="search"
            className="input pl-9"
            placeholder="Søg i enheder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Units grid */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          {searchQuery ? (
            <>
              <p className="text-neutral-500 mb-1">
                Ingen enheder matcher &quot;{searchQuery}&quot;
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-primary-600 hover:underline"
              >
                Ryd søgning
              </button>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-100 rounded-full mb-3">
                <svg
                  className="w-7 h-7 text-neutral-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
              </div>
              <p className="text-neutral-500 mb-3">Ingen enheder oprettet endnu</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary btn-sm"
              >
                Opret din første enhed
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((unit) => (
            <Link
              key={unit.id}
              href={`/app/units/${unit.id}`}
              className="card-hover block p-5 group"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary-700 transition-colors leading-snug">
                    {unit.name}
                  </h3>
                  {unit.address && (
                    <p className="text-xs text-neutral-500 mt-1 truncate">
                      {unit.address}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="badge-green text-xs">
                    {unit._count.records}{" "}
                    {unit._count.records === 1 ? "registrering" : "registreringer"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {formatDate(unit.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
