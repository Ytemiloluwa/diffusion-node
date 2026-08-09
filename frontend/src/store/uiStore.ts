'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CompaniesQuery, PolicySearchQuery, TechnologiesQuery } from '@/lib/api';

export type PolicyFilters = Omit<PolicySearchQuery, 'cursor' | 'limit'>;
export type TechnologyFilters = Omit<TechnologiesQuery, 'cursor' | 'limit'>;
export type CompanyFilters = Omit<CompaniesQuery, 'cursor' | 'limit'>;

type PersistedUiState = {
  companyFilters: CompanyFilters;
  isSidebarCollapsed: boolean;
  policyFilters: PolicyFilters;
  technologyFilters: TechnologyFilters;
};

export type UiStore = PersistedUiState & {
  resetAllFilters: () => void;
  resetCompanyFilters: () => void;
  resetPolicyFilters: () => void;
  resetTechnologyFilters: () => void;
  setCompanyFilter: <Key extends keyof CompanyFilters>(
    key: Key,
    value: CompanyFilters[Key] | undefined,
  ) => void;
  setCompanyFilters: (filters: Partial<CompanyFilters>) => void;
  setPolicyFilter: <Key extends keyof PolicyFilters>(
    key: Key,
    value: PolicyFilters[Key] | undefined,
  ) => void;
  setPolicyFilters: (filters: Partial<PolicyFilters>) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void;
  setTechnologyFilter: <Key extends keyof TechnologyFilters>(
    key: Key,
    value: TechnologyFilters[Key] | undefined,
  ) => void;
  setTechnologyFilters: (filters: Partial<TechnologyFilters>) => void;
  toggleSidebar: () => void;
};

const emptyFilters = {
  companies: {},
  policies: {},
  technologies: {},
} satisfies {
  companies: CompanyFilters;
  policies: PolicyFilters;
  technologies: TechnologyFilters;
};

const compactFilters = <Filters extends Record<string, unknown>>(filters: Filters): Filters =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== ''),
  ) as Filters;

export const useUiStore = create<UiStore>()(
  persist<UiStore, [], [], PersistedUiState>(
    (set) => ({
      companyFilters: emptyFilters.companies,
      isSidebarCollapsed: false,
      policyFilters: emptyFilters.policies,
      resetAllFilters: () =>
        set({
          companyFilters: emptyFilters.companies,
          policyFilters: emptyFilters.policies,
          technologyFilters: emptyFilters.technologies,
        }),
      resetCompanyFilters: () => set({ companyFilters: emptyFilters.companies }),
      resetPolicyFilters: () => set({ policyFilters: emptyFilters.policies }),
      resetTechnologyFilters: () => set({ technologyFilters: emptyFilters.technologies }),
      setCompanyFilter: (key, value) =>
        set((state) => ({
          companyFilters: compactFilters({
            ...state.companyFilters,
            [key]: value,
          }),
        })),
      setCompanyFilters: (filters) =>
        set((state) => ({
          companyFilters: compactFilters({
            ...state.companyFilters,
            ...filters,
          }),
        })),
      setPolicyFilter: (key, value) =>
        set((state) => ({
          policyFilters: compactFilters({
            ...state.policyFilters,
            [key]: value,
          }),
        })),
      setPolicyFilters: (filters) =>
        set((state) => ({
          policyFilters: compactFilters({
            ...state.policyFilters,
            ...filters,
          }),
        })),
      setSidebarCollapsed: (isSidebarCollapsed) => set({ isSidebarCollapsed }),
      setTechnologyFilter: (key, value) =>
        set((state) => ({
          technologyFilters: compactFilters({
            ...state.technologyFilters,
            [key]: value,
          }),
        })),
      setTechnologyFilters: (filters) =>
        set((state) => ({
          technologyFilters: compactFilters({
            ...state.technologyFilters,
            ...filters,
          }),
        })),
      technologyFilters: emptyFilters.technologies,
      toggleSidebar: () =>
        set((state) => ({
          isSidebarCollapsed: !state.isSidebarCollapsed,
        })),
    }),
    {
      name: 'diffusion-node.ui',
      partialize: (state) => ({
        companyFilters: state.companyFilters,
        isSidebarCollapsed: state.isSidebarCollapsed,
        policyFilters: state.policyFilters,
        technologyFilters: state.technologyFilters,
      }),
      storage: createJSONStorage<PersistedUiState>(() => window.localStorage),
    },
  ),
);
