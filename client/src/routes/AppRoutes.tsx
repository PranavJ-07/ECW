import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { ClubLayout } from '@/components/layout/ClubLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DashboardHomePage } from '@/pages/dashboard/DashboardHomePage';
import { BrowseEventsPage } from '@/pages/student/BrowseEventsPage';
import { EventDetailPage } from '@/pages/student/EventDetailPage';
import { MyCertificatesPage } from '@/pages/student/MyCertificatesPage';
import { MyRegistrationsPage } from '@/pages/student/MyRegistrationsPage';
import { NotificationsPage } from '@/pages/student/NotificationsPage';
import { ClubPickerPage } from '@/pages/club/ClubPickerPage';
import { ClubOverviewPage } from '@/pages/club/ClubOverviewPage';
import { ClubEventsPage } from '@/pages/club/ClubEventsPage';
import { CreateClubEventPage } from '@/pages/club/CreateClubEventPage';
import { ManageClubEventPage } from '@/pages/club/ManageClubEventPage';
import { ClubBudgetPage } from '@/pages/club/ClubBudgetPage';
import { BrowseClubsPage } from '@/pages/faculty/BrowseClubsPage';
import { AdvisedClubsPage } from '@/pages/faculty/AdvisedClubsPage';
import { FacultyClubDetailPage } from '@/pages/faculty/FacultyClubDetailPage';
import { AdminClubsPage } from '@/pages/admin/AdminClubsPage';
import { AdminClubDetailPage } from '@/pages/admin/AdminClubDetailPage';
import { AdminEventsPage } from '@/pages/admin/AdminEventsPage';
import { CollegeAnalyticsPage } from '@/pages/admin/CollegeAnalyticsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardHomePage />} />

          <Route
            path="/dashboard/analytics"
            element={
              <RequirePermission permissions={['analytics:read']}>
                <CollegeAnalyticsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/admin/clubs"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <AdminClubsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/admin/clubs/:clubSlug"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <AdminClubDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/admin/events"
            element={
              <RequirePermission permissions={['events:read']}>
                <AdminEventsPage />
              </RequirePermission>
            }
          />

          <Route
            path="/dashboard/events"
            element={
              <RequirePermission permissions={['events:read']}>
                <BrowseEventsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/events/:eventSlug"
            element={
              <RequirePermission permissions={['events:read']}>
                <EventDetailPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/my-events"
            element={
              <RequirePermission permissions={['events:register']}>
                <MyRegistrationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/certificates"
            element={
              <RequirePermission permissions={['certificates:read']}>
                <MyCertificatesPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/notifications"
            element={
              <RequirePermission permissions={['notifications:read']}>
                <NotificationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/browse-clubs"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <BrowseClubsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/browse-clubs/:clubSlug"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <FacultyClubDetailPage
                  backPath="/dashboard/browse-clubs"
                  backLabel="Back to clubs"
                />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/advised-clubs"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <AdvisedClubsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/dashboard/advised-clubs/:clubSlug"
            element={
              <RequirePermission permissions={['clubs:read']}>
                <FacultyClubDetailPage
                  backPath="/dashboard/advised-clubs"
                  backLabel="Back to advised clubs"
                />
              </RequirePermission>
            }
          />
          <Route path="/dashboard/clubs" element={<ClubPickerPage />} />

          <Route path="/dashboard/clubs/:clubSlug" element={<ClubLayout />}>
            <Route index element={<ClubOverviewPage />} />
            <Route path="events" element={<ClubEventsPage />} />
            <Route path="events/new" element={<CreateClubEventPage />} />
            <Route path="events/:eventSlug/manage" element={<ManageClubEventPage />} />
            <Route path="budget" element={<ClubBudgetPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
