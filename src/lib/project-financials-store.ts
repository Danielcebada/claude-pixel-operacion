// Helpers for reading the persisted financials slice that the project detail
// page writes to localStorage. Costs uploaded from the /costs module are
// merged on top of the project's baseline financials so dashboards
// see the most recent numbers.

import { MOCK_PROJECTS } from "./mock-data";
import type { ProjectFinancials } from "./types";

export interface PersistedFinancialsState {
  fin: Partial<ProjectFinancials>;
  status?: string;
  presupuestoConfirmado?: boolean;
  savedAt: number;
}

export function projectFinancialsStorageKey(projectId: string): string {
  return `pixel_project_financials_${projectId}`;
}

export function loadPersistedFinancials(
  projectId: string,
): PersistedFinancialsState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      projectFinancialsStorageKey(projectId),
    );
    if (!raw) return null;
    return JSON.parse(raw) as PersistedFinancialsState;
  } catch {
    return null;
  }
}

export function savePersistedFinancials(
  projectId: string,
  state: PersistedFinancialsState,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      projectFinancialsStorageKey(projectId),
      JSON.stringify(state),
    );
  } catch {
    // ignore quota / serialization errors
  }
}

// Returns the effective ProjectFinancials object for a given project id by
// merging mock baseline with whatever is persisted in localStorage.
export function getEffectiveFinancials(
  projectId: string,
): ProjectFinancials | null {
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;
  const persisted = loadPersistedFinancials(projectId);
  if (!persisted) return project.financials;
  return { ...project.financials, ...persisted.fin } as ProjectFinancials;
}
