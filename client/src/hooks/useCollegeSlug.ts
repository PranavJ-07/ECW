import { useAuth } from '@/context/AuthContext';

export function useCollegeSlug(): string {
  const { college } = useAuth();

  if (!college?.slug) {
    throw new Error('College context is required');
  }

  return college.slug;
}
