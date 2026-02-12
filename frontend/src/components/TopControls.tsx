import { IconButton, Box, Avatar, Tooltip } from '@mui/material';
import { LightMode as LightModeIcon, DarkMode as DarkModeIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useThemeMode } from '../contexts/ThemeModeContext';
import { useAuthStore } from '../store/authStore';

export default function TopControls() {
    const { mode, toggleTheme } = useThemeMode();
    const user = useAuthStore((state) => state.user);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 16,
                left: 16,
                zIndex: 1300,
                display: 'flex',
                gap: 1,
            }}
        >
            {/* Theme Toggle */}
            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                        onClick={toggleTheme}
                        sx={{
                            backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid',
                            borderColor: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.15)'
                                        : 'rgba(0, 0, 0, 0.08)',
                            },
                        }}
                    >
                        {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>
                </motion.div>
            </Tooltip>

            {/* User Profile Icon */}
            <Tooltip title={user?.username || 'User'}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            backgroundColor: '#76B900',
                            color: '#000',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: '2px solid',
                            borderColor: 'rgba(118, 185, 0, 0.3)',
                            boxShadow: '0 4px 12px rgba(118, 185, 0, 0.3)',
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                </motion.div>
            </Tooltip>
        </Box>
    );
}
