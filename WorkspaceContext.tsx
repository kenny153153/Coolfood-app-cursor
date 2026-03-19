
import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Workspace, WholesaleBrand, StaffRole } from './types';

// ─── Workspace metadata ─────────────────────────────────────────

export const WORKSPACE_META: Record<Workspace, {
  label: string;
  shortLabel: string;
  icon: string;
  colorClasses: { bg: string; text: string; accent: string; border: string; ring: string };
}> = {
  WHOLESALE: {
    label: '批發',
    shortLabel: '批發',
    icon: '🏪',
    colorClasses: {
      bg: 'bg-amber-500',
      text: 'text-amber-500',
      accent: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      ring: 'ring-amber-500/20',
    },
  },
  COOLFOOD_RETAIL: {
    label: 'Coolfood 零售',
    shortLabel: 'CF零售',
    icon: '🛒',
    colorClasses: {
      bg: 'bg-blue-500',
      text: 'text-blue-500',
      accent: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      ring: 'ring-blue-500/20',
    },
  },
};

// ─── Wholesale brand metadata ───────────────────────────────────

export const WHOLESALE_BRAND_META: Record<WholesaleBrand, {
  label: string;
  icon: string;
  colorClasses: { bg: string; text: string; accent: string; border: string };
}> = {
  GHFOODS: {
    label: '進興',
    icon: '🏭',
    colorClasses: {
      bg: 'bg-amber-500',
      text: 'text-amber-600',
      accent: 'bg-amber-50',
      border: 'border-amber-200',
    },
  },
  COOLFOOD: {
    label: 'Coolfood',
    icon: '❄️',
    colorClasses: {
      bg: 'bg-cyan-500',
      text: 'text-cyan-600',
      accent: 'bg-cyan-50',
      border: 'border-cyan-200',
    },
  },
};

// ─── Role → allowed workspaces mapping ──────────────────────────

const ROLE_WORKSPACE_ACCESS: Record<StaffRole, Workspace[] | 'all'> = {
  super_admin: 'all',
  admin: 'all',
  customer_service: 'all',
  buyer: 'all',
  accountant: 'all',
  factory: 'all',
  sales_rep: ['WHOLESALE'],
  ghfoods_staff: ['WHOLESALE'],
  coolfood_staff: ['COOLFOOD_RETAIL', 'WHOLESALE'],
  warehouse: 'all',
};

const ROLE_WHOLESALE_BRANDS: Record<StaffRole, WholesaleBrand[] | 'all'> = {
  super_admin: 'all',
  admin: 'all',
  customer_service: 'all',
  buyer: 'all',
  accountant: 'all',
  factory: 'all',
  sales_rep: 'all',
  ghfoods_staff: ['GHFOODS'],
  coolfood_staff: ['COOLFOOD'],
  warehouse: 'all',
};

const ALL_WORKSPACES: Workspace[] = ['WHOLESALE', 'COOLFOOD_RETAIL'];
const ALL_WHOLESALE_BRANDS: WholesaleBrand[] = ['GHFOODS', 'COOLFOOD'];

// ─── Context ────────────────────────────────────────────────────

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace | null) => void;
  wholesaleBrand: WholesaleBrand;
  setWholesaleBrand: (brand: WholesaleBrand) => void;
  availableWholesaleBrands: WholesaleBrand[];
  staffRole: StaffRole;
  canSwitchWorkspace: boolean;
  availableWorkspaces: Workspace[];
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  activeWorkspace: null,
  setActiveWorkspace: () => {},
  wholesaleBrand: 'GHFOODS',
  setWholesaleBrand: () => {},
  availableWholesaleBrands: ALL_WHOLESALE_BRANDS,
  staffRole: 'super_admin',
  canSwitchWorkspace: true,
  availableWorkspaces: ALL_WORKSPACES,
});

export const useWorkspace = () => useContext(WorkspaceContext);

// ─── Provider ───────────────────────────────────────────────────

interface WorkspaceProviderProps {
  children: React.ReactNode;
  staffRole: StaffRole;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children, staffRole }) => {
  const availableWorkspaces = useMemo(() => {
    const allowed = ROLE_WORKSPACE_ACCESS[staffRole];
    return allowed === 'all' ? ALL_WORKSPACES : allowed;
  }, [staffRole]);

  const availableWholesaleBrands = useMemo(() => {
    const allowed = ROLE_WHOLESALE_BRANDS[staffRole];
    return allowed === 'all' ? ALL_WHOLESALE_BRANDS : allowed;
  }, [staffRole]);

  const canSwitchWorkspace = availableWorkspaces.length > 1;

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(() => {
    if (!canSwitchWorkspace && availableWorkspaces.length === 1) {
      return availableWorkspaces[0];
    }
    return null;
  });

  const [wholesaleBrand, setWholesaleBrand] = useState<WholesaleBrand>(
    () => availableWholesaleBrands[0]
  );

  const handleSetWorkspace = (ws: Workspace | null) => {
    if (!canSwitchWorkspace && availableWorkspaces.length === 1) return;
    setActiveWorkspace(ws);
  };

  const handleSetWholesaleBrand = (brand: WholesaleBrand) => {
    if (availableWholesaleBrands.includes(brand)) {
      setWholesaleBrand(brand);
    }
  };

  const value = useMemo(() => ({
    activeWorkspace,
    setActiveWorkspace: handleSetWorkspace,
    wholesaleBrand,
    setWholesaleBrand: handleSetWholesaleBrand,
    availableWholesaleBrands,
    staffRole,
    canSwitchWorkspace,
    availableWorkspaces,
  }), [activeWorkspace, wholesaleBrand, staffRole, canSwitchWorkspace, availableWorkspaces, availableWholesaleBrands]);

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;
