import { Card, CardContent, Typography, Box, LinearProgress, Chip } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

// Mock quota data
const MOCK_QUOTA = {
    total: 8,
    used: 0,
    available: 8,
    activeRequests: 0,
};

export default function QuotaSummaryWidget() {
    const usagePercentage = (MOCK_QUOTA.used / MOCK_QUOTA.total) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
        >
            <Card
                sx={{
                    height: '100%',
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
                        GPU Quota
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {MOCK_QUOTA.used} of {MOCK_QUOTA.total} GPUs used
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {usagePercentage.toFixed(0)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={usagePercentage}
                            sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                Available
                            </Typography>
                            <Typography variant="h4" color="primary.main" fontWeight={700}>
                                {MOCK_QUOTA.available}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                                Active Requests
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                                {MOCK_QUOTA.activeRequests}
                            </Typography>
                        </Box>
                    </Box>

                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Quota Available"
                        color="success"
                        sx={{ width: '100%', fontWeight: 500 }}
                    />
                </CardContent>
            </Card>
        </motion.div>
    );
}
