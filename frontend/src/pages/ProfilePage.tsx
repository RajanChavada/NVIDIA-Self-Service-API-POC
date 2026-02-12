import { Box, Typography, Stack, Card, CardContent, Avatar, Chip, Divider } from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Business as BusinessIcon,
    LocationOn as LocationOnIcon,
    CalendarToday as CalendarIcon,
    Badge as BadgeIcon,
    Group as GroupIcon,
    SupervisorAccount as ManagerIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import AnimatedPage from '../components/AnimatedPage';

// Mock organization data
const mockOrgData = {
    organization: 'NVIDIA Corporation',
    department: 'GPU Infrastructure Engineering',
    team: 'Cloud Platform Services',
    manager: 'Aleksandr Tolynev',
    location: 'Santa Clara, CA',
    employeeId: 'NV-12345',
    joinDate: 'January 2024',
    role: 'Senior DevOps Engineer',
    email: 'testuser@nvidia.com',
    permissions: ['GPU Provisioning', 'Resource Management', 'Team Dashboard Access'],
};

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return null;
    }

    return (
        <AnimatedPage>
            <Box>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    Profile
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Your account and organization information
                </Typography>

                <Stack spacing={3}>
                    {/* Personal Information Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card
                            sx={{
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '0 12px 40px rgba(118, 185, 0, 0.2)'
                                            : '0 8px 24px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            backgroundColor: '#76B900',
                                            color: '#000',
                                            fontSize: '2rem',
                                            fontWeight: 700,
                                            mr: 3,
                                            border: '3px solid rgba(118, 185, 0, 0.3)',
                                            boxShadow: '0 4px 20px rgba(118, 185, 0, 0.3)',
                                        }}
                                    >
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700} gutterBottom>
                                            {user.username}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary">
                                            {mockOrgData.role}
                                        </Typography>
                                        <Chip
                                            label="Active"
                                            color="success"
                                            size="small"
                                            sx={{ mt: 1, fontWeight: 600 }}
                                        />
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PersonIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Username
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {user.username}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <EmailIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Email
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.email}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <BadgeIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Employee ID
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.employeeId}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <CalendarIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Join Date
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.joinDate}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Organization Details Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card
                            sx={{
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '0 12px 40px rgba(118, 185, 0, 0.2)'
                                            : '0 8px 24px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Organization Details
                                </Typography>

                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <BusinessIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Organization
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.organization}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <BusinessIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Department
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.department}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <GroupIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Team
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.team}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <ManagerIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Manager
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.manager}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <LocationOnIcon sx={{ color: 'primary.main' }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Location
                                            </Typography>
                                            <Typography variant="body1" fontWeight={500}>
                                                {mockOrgData.location}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Access & Permissions Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Card
                            sx={{
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '0 12px 40px rgba(118, 185, 0, 0.2)'
                                            : '0 8px 24px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    Access & Permissions
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Your current access levels and permissions
                                </Typography>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {mockOrgData.permissions.map((permission, index) => (
                                        <Chip
                                            key={index}
                                            label={permission}
                                            color="primary"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 500,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    backgroundColor: 'rgba(118, 185, 0, 0.1)',
                                                },
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    </motion.div>
                </Stack>
            </Box>
        </AnimatedPage>
    );
}
