import { useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, Grid, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { RadarChart } from '@mui/x-charts/RadarChart';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import RequestForm from '../components/RequestForm';
import StatusCard from '../components/StatusCard';
import RecentRequestsWidget from '../components/RecentRequestsWidget';
import QuotaSummaryWidget from '../components/QuotaSummaryWidget';
import MetricDetailModal, { type KPI } from '../components/MetricDetailModal';

// ───────────────────────────── MOCK DATA ─────────────────────────────
// Context: NVIDIA Global Testing Laboratory managing 3 GPU clusters

// KPI data with sparkline trends
const clusterKPIs: KPI[] = [
    {
        label: 'Active GPU Nodes',
        value: '342 / 384',
        trend: [320, 325, 330, 328, 335, 340, 342],
        trendLabel: '+2.1%',
        trendUp: true,
    },
    {
        label: 'Avg GPU Utilization',
        value: '78.4%',
        trend: [72, 74, 76, 75, 78, 77, 78.4],
        trendLabel: '+1.8%',
        trendUp: true,
    },
    {
        label: 'Provisioning SLA (p99)',
        value: '4m 12s',
        trend: [5.2, 4.8, 4.6, 4.5, 4.3, 4.2, 4.2],
        trendLabel: '-8.7%',
        trendUp: false,
    },
    {
        label: 'Failed Provisions (24h)',
        value: '3',
        trend: [7, 5, 4, 6, 3, 4, 3],
        trendLabel: '-25%',
        trendUp: false,
    },
];

// GPU Utilization by Cluster (24h, hourly)
const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
const utilizationByCluster = {
    a100: [62, 65, 58, 55, 52, 48, 45, 50, 65, 72, 78, 82, 85, 83, 80, 78, 76, 74, 70, 68, 65, 63, 60, 62],
    h100: [70, 72, 68, 65, 60, 55, 52, 58, 72, 80, 88, 92, 90, 88, 86, 84, 82, 80, 78, 75, 72, 70, 68, 70],
    b200: [55, 58, 52, 50, 48, 45, 42, 48, 60, 68, 72, 75, 78, 76, 74, 70, 68, 65, 62, 60, 58, 55, 52, 55],
};

// Provisioning request status (nested donut)
const requestStatusOuter = [
    { id: 0, value: 1247, label: 'Completed', color: '#4CAF50' },
    { id: 1, value: 89, label: 'Pending', color: '#2196F3' },
    { id: 2, value: 156, label: 'Provisioning', color: '#FF9800' },
    { id: 3, value: 42, label: 'Failed', color: '#F44336' },
    { id: 4, value: 18, label: 'Expired', color: '#9E9E9E' },
];
const requestStatusInner = [
    { id: 0, value: 520, label: 'A100-East', color: '#76B900' },
    { id: 1, value: 480, label: 'H100-West', color: '#00D4AA' },
    { id: 2, value: 552, label: 'B200-Central', color: '#FFB800' },
];

// GPU Temp vs Memory Bandwidth (scatter)
const generateScatterData = (cluster: string, baseTemp: number, baseBW: number, count: number) =>
    Array.from({ length: count }, (_, i) => ({
        x: baseTemp + Math.random() * 20 - 10 + i * 0.1,
        y: baseBW + Math.random() * 400 - 200,
        id: `${cluster}-${i}`,
    }));

const scatterA100 = generateScatterData('A100', 65, 1600, 40);
const scatterH100 = generateScatterData('H100', 58, 3350, 40);
const scatterB200 = generateScatterData('B200', 52, 8000, 40);

// Cluster load gauges
const clusterLoads = [
    { name: 'DGX-A100-East', load: 72, color: '#76B900' },
    { name: 'DGX-H100-West', load: 85, color: '#00D4AA' },
    { name: 'DGX-B200-Central', load: 68, color: '#FFB800' },
];

// Provisioning latency distribution (p50/p90/p99 per cluster)
const latencyClusters = ['A100-East', 'H100-West', 'B200-Central'];
const latencyP50 = [32, 28, 45];
const latencyP90 = [120, 95, 150];
const latencyP99 = [252, 210, 312];

// Developer activity radar
const radarMetrics = [
    { metric: 'Requests Made' },
    { metric: 'GPUs Consumed' },
    { metric: 'Avg Duration (h)' },
    { metric: 'Success Rate (%)' },
    { metric: 'Cost Efficiency' },
];

const radarTeams = [
    { name: 'Platform Infra', data: [85, 72, 68, 96, 80] },
    { name: 'ML Training', data: [92, 95, 85, 88, 70] },
    { name: 'Inference Ops', data: [65, 58, 45, 92, 90] },
    { name: 'DevTools', data: [40, 35, 30, 98, 95] },
    { name: 'QA Validation', data: [55, 42, 55, 94, 85] },
];

// ─────────────────────── HELPER COMPONENTS ───────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ letterSpacing: '-0.01em' }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
    );
}

function MotionCard({ children, delay = 0, sx = {}, onClick }: { children: React.ReactNode; delay?: number; sx?: object; onClick?: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
        >
            <Card
                onClick={onClick}
                sx={{
                    height: '100%',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    cursor: onClick ? 'pointer' : 'default',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: (theme: any) =>
                            theme.palette.mode === 'dark'
                                ? '0 8px 24px rgba(118, 185, 0, 0.15)'
                                : '0 4px 16px rgba(0, 0, 0, 0.12)',
                    },
                    ...sx,
                }}
            >
                {children}
            </Card>
        </motion.div>
    );
}

// ─────────────────────── MAIN COMPONENT ───────────────────────

export default function DashboardPage() {
    const [selectedKPI, setSelectedKPI] = useState<KPI | null>(null);

    return (
        <Box>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
            >
                <Typography variant="h4" gutterBottom fontWeight={700}>
                    GPU Infrastructure Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    NVIDIA Global Testing Laboratory — Multi-Cluster Provisioning & Telemetry
                </Typography>
            </motion.div>

            <Stack spacing={3}>
                {/* ─── SECTION A: Request & Status ─── */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                        <MotionCard delay={0.05}>
                            <CardContent>
                                <RequestForm />
                            </CardContent>
                        </MotionCard>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <MotionCard delay={0.1}>
                            <CardContent>
                                <StatusCard />
                            </CardContent>
                        </MotionCard>
                    </Box>
                </Stack>

                {/* ─── SECTION B: Cluster Health KPIs ─── */}
                <Grid container spacing={2}>
                    {clusterKPIs.map((kpi, idx) => (
                        <Grid size={{ xs: 6, md: 3 }} key={idx}>
                            <MotionCard
                                delay={0.1 + idx * 0.05}
                                onClick={() => setSelectedKPI(kpi)}
                            >
                                <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                                        {kpi.label}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                                        <Typography variant="h5" fontWeight={700}>
                                            {kpi.value}
                                        </Typography>
                                        <Chip
                                            label={kpi.trendLabel}
                                            size="small"
                                            color={kpi.trendUp ? 'success' : (kpi.label.includes('Failed') || kpi.label.includes('SLA') ? 'success' : 'error')}
                                            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                                        />
                                    </Box>
                                    <Box sx={{ mt: 1, height: 30 }}>
                                        <SparkLineChart
                                            data={kpi.trend}
                                            height={30}
                                            area
                                        />
                                    </Box>
                                </CardContent>
                            </MotionCard>
                        </Grid>
                    ))}
                </Grid>

                {/* Recent Requests + Quota Summary */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Box sx={{ flex: 2 }}>
                        <RecentRequestsWidget />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <QuotaSummaryWidget />
                    </Box>
                </Stack>

                {/* ─── SECTION C: Charts ─── */}

                {/* Row 1: GPU Utilization by Cluster (Line) + Request Status (Pie) */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Box sx={{ flex: 3 }}>
                        <MotionCard delay={0.2}>
                            <CardContent>
                                <SectionHeader
                                    title="GPU Utilization by Cluster"
                                    subtitle="24-hour trend across all clusters (%)"
                                />
                                <LineChart
                                    xAxis={[{
                                        scaleType: 'point',
                                        data: hours,
                                        tickLabelStyle: { fontSize: 10 },
                                    }]}
                                    series={[
                                        {
                                            data: utilizationByCluster.a100,
                                            label: 'DGX-A100-East',
                                            color: '#76B900',
                                            area: true,
                                            showMark: false,
                                        },
                                        {
                                            data: utilizationByCluster.h100,
                                            label: 'DGX-H100-West',
                                            color: '#00D4AA',
                                            area: true,
                                            showMark: false,
                                        },
                                        {
                                            data: utilizationByCluster.b200,
                                            label: 'DGX-B200-Central',
                                            color: '#FFB800',
                                            area: true,
                                            showMark: false,
                                        },
                                    ]}
                                    height={320}
                                    yAxis={[{ min: 0, max: 100, label: 'Utilization %' }]}
                                    grid={{ horizontal: true }}
                                />
                            </CardContent>
                        </MotionCard>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                        <MotionCard delay={0.25}>
                            <CardContent>
                                <SectionHeader
                                    title="Provisioning Request Status"
                                    subtitle="All-time breakdown with cluster distribution"
                                />
                                <PieChart
                                    series={[
                                        {
                                            data: requestStatusInner,
                                            innerRadius: 0,
                                            outerRadius: 60,
                                            paddingAngle: 2,
                                            cornerRadius: 3,
                                        },
                                        {
                                            data: requestStatusOuter,
                                            innerRadius: 70,
                                            outerRadius: 110,
                                            paddingAngle: 2,
                                            cornerRadius: 4,
                                        },
                                    ]}
                                    height={320}
                                />
                            </CardContent>
                        </MotionCard>
                    </Box>
                </Stack>

                {/* Row 2: Scatter Plot + Cluster Gauges */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Box sx={{ flex: 3 }}>
                        <MotionCard delay={0.3}>
                            <CardContent>
                                <SectionHeader
                                    title="GPU Temperature vs Memory Bandwidth"
                                    subtitle="Node-level telemetry across clusters (DCGM)"
                                />
                                <ScatterChart
                                    xAxis={[{ label: 'GPU Temperature (°C)', min: 40, max: 90 }]}
                                    yAxis={[{ label: 'Memory BW (GB/s)' }]}
                                    series={[
                                        { data: scatterA100, label: 'A100 80GB', color: '#76B900', markerSize: 4 },
                                        { data: scatterH100, label: 'H100 80GB', color: '#00D4AA', markerSize: 4 },
                                        { data: scatterB200, label: 'B200 192GB', color: '#FFB800', markerSize: 4 },
                                    ]}
                                    height={320}
                                    grid={{ horizontal: true, vertical: true }}
                                />
                            </CardContent>
                        </MotionCard>
                    </Box>
                    <Box sx={{ flex: 2 }}>
                        <MotionCard delay={0.35}>
                            <CardContent>
                                <SectionHeader
                                    title="Cluster Load"
                                    subtitle="Current GPU utilization per cluster"
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                                    {clusterLoads.map((cluster) => (
                                        <Box key={cluster.name} sx={{ textAlign: 'center' }}>
                                            <Gauge
                                                value={cluster.load}
                                                width={120}
                                                height={120}
                                                startAngle={-110}
                                                endAngle={110}
                                                sx={{
                                                    [`& .${gaugeClasses.valueText}`]: {
                                                        fontSize: 18,
                                                        fontWeight: 700,
                                                    },
                                                    [`& .${gaugeClasses.valueArc}`]: {
                                                        fill: cluster.color,
                                                    },
                                                }}
                                                text={({ value }) => `${value}%`}
                                            />
                                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                                                {cluster.name}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </MotionCard>
                    </Box>
                </Stack>

                {/* Row 3: Latency Distribution (Bar) + Developer Activity (Radar) */}
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
                    <Box sx={{ flex: 1 }}>
                        <MotionCard delay={0.4}>
                            <CardContent>
                                <SectionHeader
                                    title="Provisioning Latency Distribution"
                                    subtitle="p50 / p90 / p99 latency per cluster (seconds)"
                                />
                                <BarChart
                                    xAxis={[{ scaleType: 'band', data: latencyClusters }]}
                                    series={[
                                        { data: latencyP50, label: 'p50', color: '#76B900' },
                                        { data: latencyP90, label: 'p90', color: '#00D4AA' },
                                        { data: latencyP99, label: 'p99', color: '#FFB800' },
                                    ]}
                                    height={300}
                                    grid={{ horizontal: true }}
                                />
                            </CardContent>
                        </MotionCard>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <MotionCard delay={0.45}>
                            <CardContent>
                                <SectionHeader
                                    title="Developer Activity by Team"
                                    subtitle="Normalized team performance metrics"
                                />
                                <RadarChart
                                    radar={{
                                        metrics: radarMetrics.map((m) => m.metric),
                                    }}
                                    series={radarTeams.map((team, i) => ({
                                        label: team.name,
                                        data: team.data,
                                        color: ['#76B900', '#00D4AA', '#FFB800', '#2196F3', '#FF6B6B'][i],
                                    }))}
                                    height={340}
                                />
                            </CardContent>
                        </MotionCard>
                    </Box>
                </Stack>
            </Stack>

            <MetricDetailModal
                open={!!selectedKPI}
                onClose={() => setSelectedKPI(null)}
                kpi={selectedKPI}
            />
        </Box>
    );
}
