
import React, { createContext, useContext, useMemo } from 'react';

export type SiteDomain = 'coolfood' | 'ghfoods';

export interface SiteTheme {
  siteDomain: SiteDomain;
  brandName: string;
  brandNameEn: string;
  logoIcon: string;
  accentColor: string;
  bgAccentClass: string;
  textAccentClass: string;
  forceWholesale: boolean;
  showRetailNav: boolean;
}

const SITE_THEMES: Record<SiteDomain, SiteTheme> = {
  coolfood: {
    siteDomain: 'coolfood',
    brandName: 'Cool Food',
    brandNameEn: 'Cool Food',
    logoIcon: '❄️',
    accentColor: 'blue',
    bgAccentClass: 'bg-blue-600',
    textAccentClass: 'text-blue-600',
    forceWholesale: false,
    showRetailNav: true,
  },
  ghfoods: {
    siteDomain: 'ghfoods',
    brandName: '進興食品',
    brandNameEn: 'GH Foods',
    logoIcon: '🏭',
    accentColor: 'amber',
    bgAccentClass: 'bg-amber-600',
    textAccentClass: 'text-amber-600',
    forceWholesale: true,
    showRetailNav: false,
  },
};

const GHFOODS_HOSTS = [
  'ghfoods.com.hk',
  'www.ghfoods.com.hk',
  'ghfoods.localhost',
];

export function detectSiteDomain(): SiteDomain {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  if (GHFOODS_HOSTS.includes(host)) return 'ghfoods';
  return 'coolfood';
}

interface SiteContextType {
  site: SiteTheme;
  isGHFoods: boolean;
}

const SiteContext = createContext<SiteContextType>({
  site: SITE_THEMES.coolfood,
  isGHFoods: false,
});

export const useSite = () => useContext(SiteContext);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo(() => {
    const domain = detectSiteDomain();
    return {
      site: SITE_THEMES[domain],
      isGHFoods: domain === 'ghfoods',
    };
  }, []);

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};

export default SiteContext;
