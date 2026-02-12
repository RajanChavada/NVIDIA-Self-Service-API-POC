import { Card, CardContent, Typography, Box, Chip, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { MOCK_REQUESTS } from '../utils/mockData';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'completed':
            return 'success';
        case 'failed':
            return 'error';
        case 'provisioning':
            return 'warning';
        case 'pending':
            return 'info';
        default:
            return 'default';
    }
};

export default function RecentRequestsWidget() {
    const navigate = useNavigate();
    const { data: requests, isLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: api.getRequests,
        refetchInterval: 10000,
    });

    // Use API data if available, otherwise use mock data
    const displayRequests = (requests && requests.length > 0 ? requests : MOCK_REQUESTS).slice(0, 3);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Recent Requests
                        </Typography>
                        <Button
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate('/history')}
                            sx={{ textTransform: 'none' }}
                        >
                            View All
                        </Button>
                    </Box>

                    {isLoading ? (
                        <Box>
                            {[1, 2, 3].map((i) => (
                                <Box key={i} sx={{ mb: 2 }}>
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="40%" />
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Box>
                            {displayRequests.map((request, index) => (
                                <motion.div
                                    key={request.request_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Box
                                        sx={{
                                            mb: 2,
                                            pb: 2,
                                            borderBottom: index < displayRequests.length - 1 ? '1px solid' : 'none',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                                {request.request_id.substring(0, 12)}...
                                            </Typography>
                                            <Chip label={request.status} color={getStatusColor(request.status) as any} size="small" />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {request.gpu_count} GPUs • {request.duration_hours}h •{' '}
                                            {request.created_at ? new Date(request.created_at).toLocaleString() : 'N/A'}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
