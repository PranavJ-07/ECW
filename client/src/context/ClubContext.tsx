import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getMyOfficerClubs } from '@/api/clubs.api';
import { useAuth } from '@/context/AuthContext';
import type { UserClubMembership } from '@/types/club.types';

interface ClubContextValue {
  officerClubs: UserClubMembership[];
  isLoading: boolean;
  isOfficer: boolean;
  refreshClubs: () => Promise<void>;
  getClubBySlug: (slug: string) => UserClubMembership | undefined;
  isOfficerOf: (slug: string) => boolean;
}

const ClubContext = createContext<ClubContextValue | null>(null);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, college } = useAuth();
  const [officerClubs, setOfficerClubs] = useState<UserClubMembership[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshClubs = useCallback(async () => {
    if (!isAuthenticated || !college?.slug) {
      setOfficerClubs([]);
      return;
    }

    setIsLoading(true);
    try {
      const clubs = await getMyOfficerClubs(college.slug);
      setOfficerClubs(clubs);
    } catch {
      setOfficerClubs([]);
    } finally {
      setIsLoading(false);
    }
  }, [college?.slug, isAuthenticated]);

  useEffect(() => {
    void refreshClubs();
  }, [refreshClubs]);

  const getClubBySlug = useCallback(
    (slug: string) => officerClubs.find((club) => club.slug === slug),
    [officerClubs],
  );

  const isOfficerOf = useCallback(
    (slug: string) => officerClubs.some((club) => club.slug === slug),
    [officerClubs],
  );

  const value = useMemo<ClubContextValue>(
    () => ({
      officerClubs,
      isLoading,
      isOfficer: officerClubs.length > 0,
      refreshClubs,
      getClubBySlug,
      isOfficerOf,
    }),
    [officerClubs, isLoading, refreshClubs, getClubBySlug, isOfficerOf],
  );

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

export function useClubContext(): ClubContextValue {
  const context = useContext(ClubContext);

  if (!context) {
    throw new Error('useClubContext must be used within ClubProvider');
  }

  return context;
}
