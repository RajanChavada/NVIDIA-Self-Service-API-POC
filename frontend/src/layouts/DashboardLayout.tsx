import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Button,
    Switch,
    useTheme,
    useMediaQuery,
    Tooltip,
    Avatar,
    Divider,
    styled,
} from '@mui/material';
import {
    Menu as MenuIcon,
    ChevronLeft as ChevronLeftIcon,
    Dashboard as DashboardIcon,
    History as HistoryIcon,
    Person as PersonIcon,
    Assessment as AssessmentIcon,
    Logout as LogoutIcon,
    LightMode as LightModeIcon,
    NotificationsActive as NotificationsActiveIcon,
    DarkMode as DarkModeIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useThemeMode } from '../contexts/ThemeModeContext';
import Logo from '../components/Logo';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;
const SIDEBAR_TRANSITION = 'width 300ms cubic-bezier(0.4, 0, 0.2, 1)';

// Styled theme toggle switch
const ThemeSwitch = styled(Switch)(({ theme }) => ({
    width: 48,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
        padding: 2,
        margin: 0,
        transitionDuration: '250ms',
        '&.Mui-checked': {
            transform: 'translateX(22px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#76B900',
                opacity: 1,
            },
            '& .MuiSwitch-thumb': {
                backgroundColor: '#fff',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        width: 22,
        height: 22,
        backgroundColor: theme.palette.mode === 'dark' ? '#76B900' : '#888',
    },
    '& .MuiSwitch-track': {
        borderRadius: 13,
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
        opacity: 1,
    },
}));

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Request History', icon: <HistoryIcon />, path: '/history' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Quota', icon: <AssessmentIcon />, path: '/quota' },
    {
        text: 'Triage Alerting',
        icon: <NotificationsActiveIcon />,
        path: 'https://nvidia-triage-alerting.streamlit.app/',
        external: true
    },
];

export default function DashboardLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const { mode, toggleTheme } = useThemeMode();

    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavigation = (path: string, external?: boolean) => {
        if (external) {
            window.open(path, '_blank');
            return;
        }
        navigate(path);
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header: Hamburger + Logo */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 1.5,
                    py: 1.5,
                    minHeight: 64,
                    gap: 1,
                }}
            >
                <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
                    <IconButton
                        onClick={isMobile ? handleDrawerToggle : handleCollapse}
                        sx={{
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'rgba(118, 185, 0, 0.1)',
                            },
                        }}
                    >
                        {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </Tooltip>
                {!collapsed && (
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Logo collapsed={false} />
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(118, 185, 0, 0.15)' }} />

            {/* Navigation Menu */}
            <List sx={{ flex: 1, px: 1, py: 1.5 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <Tooltip title={collapsed ? item.text : ''} placement="right">
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path, item.external)}
                                    sx={{
                                        borderRadius: 2,
                                        minHeight: 48,
                                        justifyContent: collapsed ? 'center' : 'flex-start',
                                        px: collapsed ? 0 : 2,
                                        backgroundColor: isActive
                                            ? 'rgba(118, 185, 0, 0.15)'
                                            : 'transparent',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        transition: 'all 0.25s ease',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '20%',
                                            bottom: '20%',
                                            width: 3,
                                            borderRadius: '0 4px 4px 0',
                                            backgroundColor: 'primary.main',
                                            opacity: isActive ? 1 : 0,
                                            transition: 'opacity 0.25s ease',
                                        },
                                        '&:hover': {
                                            backgroundColor: isActive
                                                ? 'rgba(118, 185, 0, 0.2)'
                                                : 'rgba(118, 185, 0, 0.08)',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: collapsed ? 0 : 40,
                                            justifyContent: 'center',
                                            color: isActive ? 'primary.main' : 'text.secondary',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    {!collapsed && (
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                fontWeight: isActive ? 600 : 400,
                                                fontSize: '0.9rem',
                                                color: isActive ? 'primary.main' : 'text.primary',
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </Tooltip>
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom Section: Theme Toggle + User */}
            <Box sx={{ px: 1.5, pb: 2 }}>
                <Divider sx={{ mb: 1.5, borderColor: 'rgba(118, 185, 0, 0.15)' }} />

                {/* Theme Toggle */}
                <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`} placement="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 1.5 }}>
                        <LightModeIcon sx={{ fontSize: 14, color: mode === 'light' ? '#FFB800' : 'text.disabled' }} />
                        <ThemeSwitch
                            checked={mode === 'dark'}
                            onChange={toggleTheme}
                            size="small"
                        />
                        <DarkModeIcon sx={{ fontSize: 14, color: mode === 'dark' ? '#76B900' : 'text.disabled' }} />
                    </Box>
                </Tooltip>

                {!collapsed ? (
                    <Box>
                        {/* User Info */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                mb: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'rgba(118, 185, 0, 0.06)',
                                border: '1px solid rgba(118, 185, 0, 0.15)',
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    backgroundColor: '#76B900',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                    {user?.username || 'User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    NVIDIA Engineer
                                </Typography>
                            </Box>
                        </Box>

                        {/* Logout Button */}
                        <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                borderRadius: 2,
                                borderColor: 'rgba(118, 185, 0, 0.2)',
                                color: 'text.secondary',
                                fontSize: '0.8rem',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'rgba(118, 185, 0, 0.08)',
                                    color: 'text.primary',
                                },
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                        <Tooltip title={user?.username || 'User'} placement="right">
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    backgroundColor: '#76B900',
                                    color: '#000',
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                }}
                            >
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </Avatar>
                        </Tooltip>
                        <Tooltip title="Logout" placement="right">
                            <IconButton
                                onClick={handleLogout}
                                size="small"
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        color: 'primary.main',
                                        backgroundColor: 'rgba(118, 185, 0, 0.1)',
                                    },
                                }}
                            >
                                <LogoutIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: { md: drawerWidth },
                    flexShrink: { md: 0 },
                    transition: SIDEBAR_TRANSITION,
                }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            transition: SIDEBAR_TRANSITION,
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    transition: SIDEBAR_TRANSITION,
                }}
            >
                {/* Mobile hamburger for small screens */}
                {isMobile && (
                    <Box sx={{ px: 2, pt: 2 }}>
                        <IconButton onClick={handleDrawerToggle} sx={{ color: 'primary.main' }}>
                            <MenuIcon />
                        </IconButton>
                    </Box>
                )}

                <Box sx={{ flex: 1, p: 3 }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </Box>

                {/* Footer */}
                <Box
                    component="footer"
                    sx={{
                        py: 1.5,
                        px: 3,
                        mt: 'auto',
                        textAlign: 'center',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        © 2026 NVIDIA Corporation — Global Testing Laboratory
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
