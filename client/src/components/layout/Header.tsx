import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getUnreadCount } from '@/api/notifications.api';
import { resolvePageTitle } from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useThemeMode } from '@/context/ThemeContext';
import { useCollegeSlug } from '@/hooks/useCollegeSlug';
import { DRAWER_WIDTH } from '@/components/layout/Sidebar';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const collegeSlug = useCollegeSlug();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?';

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadUnread(): Promise<void> {
      try {
        const result = await getUnreadCount(collegeSlug);
        if (!cancelled) {
          setUnreadCount(result.total);
        }
      } catch {
        if (!cancelled) {
          setUnreadCount(0);
        }
      }
    }

    void loadUnread();

    return () => {
      cancelled = true;
    };
  }, [collegeSlug, isAuthenticated, location.pathname]);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      color="inherit"
      sx={{
        width: `calc(100% - ${DRAWER_WIDTH}px)`,
        ml: `${DRAWER_WIDTH}px`,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="text.primary">
          {resolvePageTitle(location.pathname)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={() => navigate('/dashboard/notifications')}>
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton onClick={toggleMode} color="inherit">
              {mode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
            </IconButton>
          </Tooltip>

          <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
              {initials}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
              <Typography variant="subtitle2">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <MenuItem onClick={handleLogout}>
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              Log out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
