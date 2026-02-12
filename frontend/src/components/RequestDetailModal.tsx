import {
    Box,
    Typography,
    Modal,
    Paper,
    Grid,
    Chip,
    IconButton,
    Divider,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {
    PieChart,
    BarChart,
    LineChart,
    Gauge,
    gaugeClasses,
} from '@mui/x-charts';
import { type RequestResponse } from '../services/api';
import { useMemo } from 'react';

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    request: RequestResponse | null;
}

const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    const theme = useTheme();

    // Helper for stable mock data
    const getStableRandom = (seed: string) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    // Mock Data Logic based on request details
    const analyticsData = useMemo(() => {
        if (!request) return null;

        const seed = request.request_id || 'default';
        const randomVal = getStableRandom(seed);

        // 1. Quota Usage (The "Am I Blocked?" Graph)
        // Mock logic: generate usage based on hash to be stable
        // In a real app, this would come from a "user quota" endpoint
        const totalQuota = 16; // Mock total quota
        const currentUsage = (request.gpu_count || 0) + (randomVal % 8); // Mock existing usage
        const usagePercent = (currentUsage / totalQuota) * 100;

        // 2. Request Timeline (The "Wait Time" Graph)
        // Mock segments based on stable hash
        const provisioningTime = (randomVal % 15) + 5; // 5-20 mins
        const pendingTime = ((randomVal >>> 2) % 10) + 2; // 2-12 mins
        const activeTime = (request.duration_hours || 1) * 60; // Convert hours to mins

        // 3. Resource Distribution (The "What am I hoarding?" Graph)
        // Mock distribution based on stable hash
        const resourceDistribution = [
            { id: 0, value: (randomVal % 5) + 1, label: 'H100', color: theme.palette.mode === 'dark' ? '#76B900' : '#4dabf5' },
            { id: 1, value: ((randomVal >>> 1) % 3) + 1, label: 'A100', color: theme.palette.mode === 'dark' ? '#00D4AA' : '#90caf9' }, // Cyan/Light Blue
            { id: 2, value: ((randomVal >>> 2) % 2) + 1, label: 'V100', color: theme.palette.mode === 'dark' ? '#555555' : '#e0e0e0' }, // Grey
        ];

        // 4. Provisioning Success Rate (The "Is the system broken?" Graph)
        // Mock 7-day trend
        const successRateTrend = [95, 98, 92, 99, 97, 96, 98];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return {
            quota: { current: currentUsage, total: totalQuota, percent: usagePercent },
            timeline: { pending: pendingTime, provisioning: provisioningTime, active: activeTime },
            distribution: resourceDistribution,
            successRate: { data: successRateTrend, labels: days },
        };
    }, [request, theme.palette.mode]);

    if (!request || !analyticsData) return null;

    const isDark = theme.palette.mode === 'dark';
    const nvidiaGreen = '#76B900';

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="request-detail-title"
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                backdropFilter: 'blur(8px)',
            }}
        >
            <Paper
                elevation={24}
                sx={{
                    width: '100%',
                    maxWidth: 1400,
                    maxHeight: '95vh',
                    overflowY: 'auto',
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: isDark ? `1px solid rgba(118, 185, 0, 0.3)` : 'none',
                    boxShadow: isDark ? '0 0 40px rgba(118, 185, 0, 0.2)' : '0 10px 40px rgba(0,0,0,0.1)',
                }}
            >
                {/* Header */}
                <Box sx={{
                    p: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isDark
                        ? 'linear-gradient(90deg, rgba(118, 185, 0, 0.1) 0%, rgba(0,0,0,0) 50%)'
                        : 'linear-gradient(90deg, rgba(118, 185, 0, 0.05) 0%, rgba(255,255,255,0) 50%)',
                }}>
                    <Box>
                        <Typography variant="h5" component="h2" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            Request Details
                            <Chip
                                label={request.status.toUpperCase()}
                                color={
                                    request.status === 'completed' ? 'success' :
                                        request.status === 'failed' ? 'error' :
                                            request.status === 'provisioning' ? 'warning' : 'default'
                                }
                                variant="outlined"
                                size="small"
                                sx={{ fontWeight: 'bold' }}
                            />
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', mt: 0.5, display: 'block' }}>
                            ID: {request.request_id}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="large" sx={{ '&:hover': { color: 'error.main' } }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Content Grid */}
                <Box sx={{ p: 4 }}>
                    <Grid container spacing={4}>
                        {/* 1. Usage & Quota Visualization */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Paper sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Quota Usage (Am I Blocked?)
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    Total Allocated vs. Quota Limit
                                </Typography>
                                <Box sx={{ height: 200, position: 'relative' }}>
                                    <Gauge
                                        value={analyticsData.quota.percent}
                                        startAngle={-110}
                                        endAngle={110}
                                        sx={{
                                            [`& .${gaugeClasses.valueText}`]: {
                                                fontSize: 24,
                                                fontWeight: 'bold',
                                                fill: isDark ? '#fff' : '#000',
                                                transform: 'translate(0px, 0px)',
                                            },
                                            [`& .${gaugeClasses.valueArc}`]: {
                                                fill: analyticsData.quota.percent > 90 ? theme.palette.error.main : nvidiaGreen,
                                            },
                                        }}
                                        text={
                                            () => `${analyticsData.quota.current} / ${analyticsData.quota.total}`
                                        }
                                    />
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 10,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            color: analyticsData.quota.percent > 90 ? 'error.main' : 'text.secondary',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {analyticsData.quota.percent > 90 ? 'QUOTA CRITICAL' : 'Available'}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 2. Request Timeline */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Paper sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Request Queue Timeline
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    breakdown of time spent in each state
                                </Typography>
                                <Box sx={{ height: 200, width: '100%' }}>
                                    <BarChart
                                        layout="horizontal"
                                        series={[
                                            { data: [analyticsData.timeline.pending], label: 'Pending (Queue)', color: theme.palette.action.disabled },
                                            { data: [analyticsData.timeline.provisioning], label: 'Provisioning', color: theme.palette.info.main },
                                            { data: [analyticsData.timeline.active], label: 'Active', color: nvidiaGreen },
                                        ]}
                                        yAxis={[{ scaleType: 'band', data: ['Request'] }]}
                                        xAxis={[{ label: 'Minutes Duration' }]}
                                        margin={{ left: 60 }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 3. Resource Distribution */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Paper sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    Resource Mix
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    Your GPU Types
                                </Typography>
                                <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PieChart
                                        series={[
                                            {
                                                data: analyticsData.distribution,
                                                innerRadius: 30,
                                                outerRadius: 70,
                                                paddingAngle: 2,
                                                cornerRadius: 4,
                                                highlightScope: { fade: 'global', highlight: 'item' },
                                            },
                                        ]}
                                        slotProps={{ legend: { hidden: true } as any }}
                                        height={180}
                                        width={180}
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    {analyticsData.distribution.map((item) => (
                                        <Typography key={item.label} variant="caption" sx={{ color: item.color, fontWeight: 'bold' }}>
                                            {item.label}: {item.value}
                                        </Typography>
                                    ))}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* 4. Provisioning Success Rate */}
                        <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                            <Paper sx={{ p: 2, height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                    System Health
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                    7-Day Success Rate
                                </Typography>
                                <Typography variant="h3" color="success.main" fontWeight="bold">
                                    98%
                                </Typography>
                                <Box sx={{ height: 120 }}>
                                    <LineChart
                                        series={[
                                            {
                                                data: analyticsData.successRate.data,
                                                color: theme.palette.success.main,
                                                area: true,
                                                showMark: false,
                                            },
                                        ]}
                                        xAxis={[{ data: analyticsData.successRate.labels, scaleType: 'point', disableTicks: true }]}
                                        margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Additional Metadata */}
                        <Grid size={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="overline" color="text.secondary">
                                Technical Details
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 4, mt: 1 }}>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">KUBERNETES VERSION</Typography>
                                    <Typography variant="body2">v1.29.3-nvidia</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">DRIVER VERSION</Typography>
                                    <Typography variant="body2">535.161.07</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" display="block" color="text.secondary">INSTANCE TYPE</Typography>
                                    <Typography variant="body2">p4d.24xlarge</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Modal>
    );
};

export default RequestDetailModal;
