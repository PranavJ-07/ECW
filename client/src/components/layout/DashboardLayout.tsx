import { Box, Container, Toolbar } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar, DRAWER_WIDTH } from '@/components/layout/Sidebar';

export function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar />
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
