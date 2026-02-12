import {
    Box,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Chip,
    Grid,
} from '@mui/material';
import {
    Memory as MemoryIcon,
    Speed as SpeedIcon,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { motion } from 'framer-motion';
import AnimatedPage from '../components/AnimatedPage';

// ───────────────── CLUSTER QUOTA DATA ─────────────────

const clusters = [
    {
        name: 'DGX-A100-East',
        gpu: 'A100 80GB',
        total: 128,
        allocated: 96,
        available: 32,
        activeJobs: 14,
        color: '#76B900',
        memoryTotal: 10240, // GB total
        memoryUsed: 7680,
    },
    {
        name: 'DGX-H100-West',
        gpu: 'H100 80GB',
        total: 128,
        allocated: 108,
        available: 20,
        activeJobs: 22,
        color: '#00D4AA',
        memoryTotal: 10240,
        memoryUsed: 8640,
    },
    {
        name: 'DGX-B200-Central',
        gpu: 'B200 192GB',
        total: 128,
        allocated: 88,
        available: 40,
        activeJobs: 11,
        color: '#FFB800',
        memoryTotal: 24576,
        memoryUsed: 16896,
    },
];

const totalGPUs = clusters.reduce((sum, c) => sum + c.total, 0);
const allocatedGPUs = clusters.reduce((sum, c) => sum + c.allocated, 0);

// KPIs
const quotaKPIs = [
    { label: 'Total GPU Allocation', value: `${allocatedGPUs} / ${totalGPUs}`, trend: [340, 355, 360, 370, 375, 380, allocatedGPUs], trendLabel: '+3.2%' },
    { label: 'Active Provisioning Jobs', value: '47', trend: [35, 38, 42, 40, 45, 44, 47], trendLabel: '+6.8%' },
    { label: 'Avg Queue Wait Time', value: '1m 42s', trend: [3.5, 3.0, 2.5, 2.2, 2.0, 1.8, 1.7], trendLabel: '-15%' },
    { label: 'Quota Utilization', value: '76.0%', trend: [70, 72, 73, 74, 75, 75, 76], trendLabel: '+1.3%' },
];

// GPU type allocation pie
const gpuTypeAllocation = [
    { id: 0, value: 96, label: 'A100 80GB (96)', color: '#76B900' },
    { id: 1, value: 108, label: 'H100 80GB (108)', color: '#00D4AA' },
    { id: 2, value: 88, label: 'B200 192GB (88)', color: '#FFB800' },
];

// Weekly utilization trend per cluster
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeklyTrend = {
    a100: [72, 75, 78, 74, 80, 65, 58],
    h100: [82, 85, 88, 84, 90, 72, 68],
    b200: [65, 68, 70, 72, 75, 55, 48],
};

// Resource allocation by team (bar chart)
const teams = ['Platform Infra', 'ML Training', 'Inference Ops', 'DevTools', 'QA'];
const teamAllocA100 = [28, 32, 16, 12, 8];
const teamAllocH100 = [20, 42, 24, 14, 8];
const teamAllocB200 = [18, 35, 15, 12, 8];

// ───────────────── HELPERS ─────────────────

function MotionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }}>
            <Card sx={{
                height: '100%',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (theme: any) => theme.palette.mode === 'dark'
                        ? '0 8px 24px rgba(118, 185, 0, 0.15)'
                        : '0 4px 16px rgba(0, 0, 0, 0.12)',
                },
            }}>
                {children}
            </Card>
        </motion.div>
    );
}

// ───────────────── MAIN ─────────────────

export default function QuotaPage() {
    return (
        <AnimatedPage>
            <Box>
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    GPU Quota & Allocation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Multi-cluster resource allocation, quotas, and capacity planning
                </Typography>

                <Stack spacing={3}>
                    {/* KPI Cards */}
                    <Grid container spacing={2}>
                        {quotaKPIs.map((kpi, idx) => (
                            <Grid size={{ xs: 6, md: 3 }} key={idx}>
                                <MotionCard delay={idx * 0.05}>
                                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                                            {kpi.label}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                                            <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                                            <Chip label={kpi.trendLabel} size="small" color="success" sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }} />
                                        </Box>
                                        <Box sx={{ mt: 1, height: 30 }}>
                                            <SparkLineChart data={kpi.trend} height={30} area />
                                        </Box>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Per-Cluster Quota Cards */}
                    <Grid container spacing={2}>
                        {clusters.map((cluster, idx) => (
                            <Grid size={{ xs: 12, md: 4 }} key={idx}>
                                <MotionCard delay={0.15 + idx * 0.05}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cluster.color }} />
                                            <Typography variant="subtitle1" fontWeight={600}>{cluster.name}</Typography>
                                            <Chip label={cluster.gpu} size="small" variant="outlined" sx={{ ml: 'auto', fontSize: '0.7rem', height: 22 }} />
                                        </Box>

                                        {/* GPU Allocation */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    GPU Nodes: {cluster.allocated} / {cluster.total}
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600}>
                                                    {((cluster.allocated / cluster.total) * 100).toFixed(0)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(cluster.allocated / cluster.total) * 100}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    '& .MuiLinearProgress-bar': { backgroundColor: cluster.color },
                                                }}
                                            />
                                        </Box>

                                        {/* Memory Utilization */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    VRAM: {(cluster.memoryUsed / 1024).toFixed(1)} / {(cluster.memoryTotal / 1024).toFixed(1)} TB
                                                </Typography>
                                                <Typography variant="caption" fontWeight={600}>
                                                    {((cluster.memoryUsed / cluster.memoryTotal) * 100).toFixed(0)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(cluster.memoryUsed / cluster.memoryTotal) * 100}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    backgroundColor: 'rgba(255,255,255,0.08)',
                                                    '& .MuiLinearProgress-bar': { backgroundColor: cluster.color, opacity: 0.7 },
                                                }}
                                            />
                                        </Box>

                                        <Stack direction="row" spacing={1}>
                                            <Chip icon={<MemoryIcon />} label={`${cluster.available} avail`} size="small" sx={{ fontSize: '0.7rem' }} />
                                            <Chip icon={<SpeedIcon />} label={`${cluster.activeJobs} jobs`} size="small" sx={{ fontSize: '0.7rem' }} />
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Charts Row 1: GPU Type Allocation Pie + Weekly Utilization Line */}
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                        <Box sx={{ flex: 2 }}>
                            <MotionCard delay={0.3}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        GPU Type Allocation
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Distribution across GPU architectures
                                    </Typography>
                                    <PieChart
                                        series={[{
                                            data: gpuTypeAllocation,
                                            innerRadius: 40,
                                            outerRadius: 100,
                                            paddingAngle: 3,
                                            cornerRadius: 5,
                                        }]}
                                        height={280}
                                    />
                                </CardContent>
                            </MotionCard>
                        </Box>
                        <Box sx={{ flex: 3 }}>
                            <MotionCard delay={0.35}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Weekly Utilization Trend
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Per-cluster utilization over the past week
                                    </Typography>
                                    <LineChart
                                        xAxis={[{ scaleType: 'point', data: weekDays }]}
                                        series={[
                                            { data: weeklyTrend.a100, label: 'A100-East', color: '#76B900', area: true, showMark: false },
                                            { data: weeklyTrend.h100, label: 'H100-West', color: '#00D4AA', area: true, showMark: false },
                                            { data: weeklyTrend.b200, label: 'B200-Central', color: '#FFB800', area: true, showMark: false },
                                        ]}
                                        yAxis={[{ min: 0, max: 100, label: 'Utilization %' }]}
                                        height={280}
                                        grid={{ horizontal: true }}
                                    />
                                </CardContent>
                            </MotionCard>
                        </Box>
                    </Stack>

                    {/* Charts Row 2: Resource Allocation by Team (Stacked Bar) + Cluster Gauges */}
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                        <Box sx={{ flex: 3 }}>
                            <MotionCard delay={0.4}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Resource Allocation by Team
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        GPU nodes allocated per team across clusters
                                    </Typography>
                                    <BarChart
                                        xAxis={[{ scaleType: 'band', data: teams }]}
                                        series={[
                                            { data: teamAllocA100, label: 'A100-East', color: '#76B900', stack: 'total' },
                                            { data: teamAllocH100, label: 'H100-West', color: '#00D4AA', stack: 'total' },
                                            { data: teamAllocB200, label: 'B200-Central', color: '#FFB800', stack: 'total' },
                                        ]}
                                        height={300}
                                        grid={{ horizontal: true }}
                                    />
                                </CardContent>
                            </MotionCard>
                        </Box>
                        <Box sx={{ flex: 2 }}>
                            <MotionCard delay={0.45}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight={600} gutterBottom>
                                        Cluster Capacity Gauges
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Current allocation pressure
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                        {clusters.map((c) => (
                                            <Box key={c.name} sx={{ textAlign: 'center' }}>
                                                <Gauge
                                                    value={Math.round((c.allocated / c.total) * 100)}
                                                    width={110}
                                                    height={110}
                                                    startAngle={-110}
                                                    endAngle={110}
                                                    sx={{
                                                        [`& .${gaugeClasses.valueText}`]: { fontSize: 16, fontWeight: 700 },
                                                        [`& .${gaugeClasses.valueArc}`]: { fill: c.color },
                                                    }}
                                                    text={({ value }) => `${value}%`}
                                                />
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                                                    {c.name}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                            </MotionCard>
                        </Box>
                    </Stack>
                </Stack>
            </Box>
        </AnimatedPage>
    );
}
