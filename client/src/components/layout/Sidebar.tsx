import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { NavLink } from 'react-router-dom';
import {
  adminPrimaryNavItems,
  getVisibleNavItems,
  type NavIconKey,
  type NavItem,
} from '@/config/navigation';
import { useAuth } from '@/context/AuthContext';
import { useClubContext } from '@/context/ClubContext';
import { isCollegeAdmin, hasPermission } from '@/utils/roles';

export const DRAWER_WIDTH = 260;

export function Sidebar() {
  const { college, permissions, user } = useAuth();
  const { isOfficer } = useClubContext();

  const mainNavItems = user
    ? getVisibleNavItems(user.roles, permissions, isOfficer)
    : [];

  const showLegacyAdminSection =
    user && !isCollegeAdmin(user.roles)
      ? adminPrimaryNavItems.filter(
          (item) => item.permission && hasPermission(permissions, item.permission),
        )
      : [];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Toolbar sx={{ px: 2.5 }}>
        <Box>
          <Typography variant="h6" color="primary">
            EthiCraft
          </Typography>
          {college ? (
            <Typography variant="caption" color="text.secondary">
              {college.name}
            </Typography>
          ) : null}
        </Box>
      </Toolbar>

      <Divider />

      <List sx={{ px: 1.5, py: 1 }}>
        {mainNavItems.map((item) => (
          <SidebarLink key={item.path} {...item} />
        ))}
      </List>

      {showLegacyAdminSection.length ? (
        <>
          <Divider sx={{ mx: 2 }} />
          <Typography variant="overline" color="text.secondary" sx={{ px: 2.5, pt: 1 }}>
            Admin
          </Typography>
          <List sx={{ px: 1.5, py: 1 }}>
            {showLegacyAdminSection.map((item) => (
              <SidebarLink key={item.path} {...item} />
            ))}
          </List>
        </>
      ) : null}
    </Drawer>
  );
}

function SidebarLink({ label, path, icon, end }: NavItem) {
  return (
    <ListItemButton
      component={NavLink}
      to={path}
      end={end}
      sx={{
        borderRadius: 2,
        mb: 0.5,
        '&.active': {
          bgcolor: 'action.selected',
          color: 'primary.main',
          '& .MuiListItemIcon-root': {
            color: 'primary.main',
          },
        },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>{navIcon(icon)}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  );
}

function navIcon(key: NavIconKey) {
  switch (key) {
    case 'overview':
      return <DashboardOutlinedIcon />;
    case 'events':
      return <EventOutlinedIcon />;
    case 'my-events':
      return <EventAvailableOutlinedIcon />;
    case 'certificates':
      return <EmojiEventsOutlinedIcon />;
    case 'notifications':
      return <NotificationsOutlinedIcon />;
    case 'analytics':
      return <InsightsOutlinedIcon />;
    case 'clubs':
      return <GroupsOutlinedIcon />;
    case 'advised':
      return <SchoolOutlinedIcon />;
    case 'directory':
      return <MenuBookOutlinedIcon />;
  }
}
