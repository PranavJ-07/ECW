import { AppThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClubProvider } from '@/context/ClubContext';
import { AppRoutes } from '@/routes/AppRoutes';

export default function App() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <ClubProvider>
          <AppRoutes />
        </ClubProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
