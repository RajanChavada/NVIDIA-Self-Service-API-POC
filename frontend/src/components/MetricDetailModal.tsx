import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    IconButton,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import CloseIcon from '@mui/icons-material/Close';

// ───────────────────────────── TYPES & INTERFACES ─────────────────────────────

export interface KPI {
    label: string;
    value: string;
    trend: number[];
    trendLabel: string;
    trendUp: boolean;
}

interface MetricDetailModalProps {
    open: boolean;
    onClose: () => void;
    kpi: KPI | null;
}

// ───────────────────────────── MOCK DATA GENERATORS ─────────────────────────────

// 1. Active GPU Nodes Data
const generateActiveNodes = () => {
    const clusters = ['DGX-A100-East', 'DGX-H100-West', 'DGX-B200-Central'];
    const users = ['alice', 'bob', 'charlie', 'dave', 'eve', 'system'];
    const gpuTypes = { 'DGX-A100-East': 'A100 80GB', 'DGX-H100-West': 'H100 80GB', 'DGX-B200-Central': 'B200 192GB' };

    return Array.from({ length: 50 }, (_, i) => {
        const cluster = clusters[Math.floor(Math.random() * clusters.length)];
        const status = Math.random() > 0.8 ? (Math.random() > 0.5 ? 'Idle' : 'Maintenance') : 'Active';
        return {
            id: `node-${100 + i}`,
            cluster: cluster,
            gpuType: gpuTypes[cluster as keyof typeof gpuTypes],
            status: status,
            user: status === 'Active' ? users[Math.floor(Math.random() * users.length)] : '-',
            utilization: status === 'Active' ? Math.floor(Math.random() * 40 + 60) + '%' : '0%',
            uptime: `${Math.floor(Math.random() * 14)}d ${Math.floor(Math.random() * 24)}h`,
        };
    });
};

const activeNodesRows = generateActiveNodes();

const activeNodesColumns: GridColDef[] = [
    {
        field: 'id', headerName: 'Node ID', width: 120, renderCell: (params) => (
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {params.value}
            </Typography>
        )
    },
    { field: 'cluster', headerName: 'Cluster', width: 160 },
    { field: 'gpuType', headerName: 'GPU Type', width: 140 },
    {
        field: 'status', headerName: 'Status', width: 120, renderCell: (params: GridRenderCellParams) => {
            const colors: Record<string, "success" | "warning" | "error" | "default"> = {
                'Active': 'success',
                'Idle': 'warning',
                'Maintenance': 'error',
                'Drain': 'default'
            };
            return <Chip label={params.value as string} size="small" color={colors[params.value as string]} variant="outlined" />;
        }
    },
    { field: 'user', headerName: 'User', width: 100 },
    { field: 'utilization', headerName: 'Util %', width: 100 },
    { field: 'uptime', headerName: 'Uptime', width: 120 },
];

// 2. Failed Provisions Data
const generateFailedProvisions = () => {
    const errorMessages = [
        'Insufficient capacity in requested cluster',
        'Timeout waiting for node registration',
        'Quota exceeded for user',
        'Network unreachable: vlan-404',
        'Driver version mismatch'
    ];
    return Array.from({ length: 15 }, (_, i) => ({
        id: `req-fail-${1000 + i}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
        user: ['alice', 'bob', 'training-team'][Math.floor(Math.random() * 3)],
        cluster: ['DGX-A100-East', 'DGX-H100-West'][Math.floor(Math.random() * 2)],
        error: errorMessages[Math.floor(Math.random() * errorMessages.length)],
    })).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

const failedProvisionsRows = generateFailedProvisions();

const failedProvisionsColumns: GridColDef[] = [
    { field: 'timestamp', headerName: 'Time', width: 160 },
    { field: 'id', headerName: 'Request ID', width: 140 },
    { field: 'user', headerName: 'User', width: 120 },
    { field: 'cluster', headerName: 'Target Cluster', width: 150 },
    {
        field: 'error', headerName: 'Error Message', flex: 1, renderCell: (params) => (
            <Typography variant="body2" color="error" sx={{ fontSize: '0.85rem' }}>
                {params.value}
            </Typography>
        )
    },
];

// 3. Utilization Detailed Trend (Mock 24h data with 15min resolution)
const utilizationTrendData = Array.from({ length: 96 }, (_, i) => ({
    x: i,
    y1: 60 + Math.random() * 20 + Math.sin(i / 10) * 10, // Cluster A
    y2: 40 + Math.random() * 15 + Math.cos(i / 8) * 15, // Cluster B
    y3: 70 + Math.random() * 25 + Math.sin(i / 5) * 5,  // Cluster C
}));

// 4. SLA Latency Breakdown
const slaBreakdownData = [
    { label: 'p50', val: 32 },
    { label: 'p90', val: 95 },
    { label: 'p99', val: 210 },
];


// ───────────────────────────── COMPONENT ─────────────────────────────

export default function MetricDetailModal({ open, onClose, kpi }: MetricDetailModalProps) {
    if (!kpi) return null;

    // Determine content based on title
    const renderContent = () => {
        const title = kpi.label.toLowerCase();

        if (title.includes('active gpu nodes')) {
            return (
                <Box sx={{ height: 500, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Live status of all GPU nodes across clusters. Click rows for node details.
                    </Typography>
                    <DataGrid
                        rows={activeNodesRows}
                        columns={activeNodesColumns}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 25]}
                        disableRowSelectionOnClick
                        density="compact"
                        sx={{ border: 'none' }}
                    />
                </Box>
            );
        }

        if (title.includes('failed provisions')) {
            return (
                <Box sx={{ height: 500, width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Log of failed provisioning requests in the last 7 days.
                    </Typography>
                    <DataGrid
                        rows={failedProvisionsRows}
                        columns={failedProvisionsColumns}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 25]}
                        disableRowSelectionOnClick
                        density="compact"
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-row': {
                                '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
                            }
                        }}
                    />
                </Box>
            );
        }

        if (title.includes('utilization')) {
            return (
                <Box sx={{ height: 500, width: '100%', pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        High-resolution utilization metrics (15-min intervals) over last 24 hours.
                    </Typography>
                    <LineChart
                        series={[
                            { data: utilizationTrendData.map(d => d.y1), label: 'DGX-A100-East', color: '#76B900', showMark: false },
                            { data: utilizationTrendData.map(d => d.y2), label: 'DGX-H100-West', color: '#00D4AA', showMark: false },
                            { data: utilizationTrendData.map(d => d.y3), label: 'DGX-B200-Central', color: '#FFB800', showMark: false },
                        ]}
                        xAxis={[{
                            data: utilizationTrendData.map(d => d.x),
                            label: 'Time (15m intervals)',
                            valueFormatter: (v: number) => `${Math.floor(v / 4)}:${(v % 4) * 15}`.padStart(5, '0')
                        }]}
                        yAxis={[{ label: 'Utilization %', min: 0, max: 100 }]}
                        height={400}
                        grid={{ horizontal: true, vertical: true }}
                    />
                </Box>
            );
        }

        if (title.includes('sla')) {
            return (
                <Box sx={{ height: 500, width: '100%', pt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Provisioning time percentiles (lower is better).
                    </Typography>
                    <BarChart
                        xAxis={[{ scaleType: 'band', data: slaBreakdownData.map(d => d.label) }]}
                        series={[
                            { data: slaBreakdownData.map(d => d.val), label: 'Seconds', color: '#00D4AA' }
                        ]}
                        height={350}
                        grid={{ horizontal: true }}
                    />
                </Box>
            );
        }

        return <Typography>No details available for this metric.</Typography>;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(145deg, rgba(20,20,20,0.95) 0%, rgba(30,30,30,0.95) 100%)'
                        : '#ffffff',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(118, 185, 0, 0.2)',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2
            }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {kpi.label}
                        <Chip
                            label={kpi.value}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {renderContent()}
            </DialogContent>

            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <Button onClick={onClose} variant="outlined" color="inherit">
                    Close
                </Button>
                <Button onClick={onClose} variant="contained" sx={{
                    bgcolor: '#76B900',
                    color: '#000',
                    '&:hover': { bgcolor: '#8FD125' }
                }}>
                    Export Report
                </Button>
            </DialogActions>
        </Dialog>
    );
}
