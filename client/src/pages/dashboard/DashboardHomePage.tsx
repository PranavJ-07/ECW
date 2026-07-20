import { useAuth } from '@/context/AuthContext';
import { resolveDashboardPersona } from '@/utils/roles';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { FacultyDashboardPage } from '@/pages/faculty/FacultyDashboardPage';
import { StudentDashboardPage } from '@/pages/student/StudentDashboardPage';

export function DashboardHomePage() {
  const { user } = useAuth();

  if (!user) return null;

  const persona = resolveDashboardPersona(user.roles);

  if (persona === 'admin') {
    return <AdminDashboardPage />;
  }

  if (persona === 'faculty') {
    return <FacultyDashboardPage />;
  }

  return <StudentDashboardPage />;
}
