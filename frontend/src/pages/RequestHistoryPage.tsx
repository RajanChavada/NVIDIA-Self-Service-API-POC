import { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Link,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import { api, type RequestResponse } from '../services/api';
import AnimatedPage from '../components/AnimatedPage';
import RequestDetailModal from '../components/RequestDetailModal';

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

export default function RequestHistoryPage() {
    const [selectedRequest, setSelectedRequest] = useState<RequestResponse | null>(null);

    const { data: requests, isLoading } = useQuery({
        queryKey: ['requests'],
        queryFn: api.getRequests,
        refetchInterval: 10000,
    });

    const columns: GridColDef<RequestResponse>[] = useMemo(
        () => [
            {
                field: 'request_id',
                headerName: 'Request ID',
                width: 280,
                renderCell: (params) => (
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => setSelectedRequest(params.row)}
                        sx={{
                            fontFamily: 'monospace',
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' },
                            textAlign: 'left',
                        }}
                    >
                        {params.value.substring(0, 8)}...
                    </Link>
                ),
            },
            {
                field: 'gpu_count',
                headerName: 'GPUs',
                width: 100,
            },
            {
                field: 'duration_hours',
                headerName: 'Duration',
                width: 120,
                renderCell: (params) => `${params.value}h`,
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 150,
                renderCell: (params) => (
                    <Chip
                        label={params.value}
                        color={getStatusColor(params.value) as any}
                        size="small"
                    />
                ),
            },
            {
                field: 'created_at',
                headerName: 'Created At',
                width: 200,
                renderCell: (params) =>
                    params.value ? new Date(params.value).toLocaleString() : '-',
            },
            {
                field: 'completed_at',
                headerName: 'Completed At',
                width: 200,
                renderCell: (params) =>
                    params.value ? new Date(params.value).toLocaleString() : '-',
            },
        ],
        []
    );

    return (
        <AnimatedPage>
            <Box>
                <Typography variant="h4" gutterBottom>
                    Request History
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    View all your GPU provisioning requests
                </Typography>

                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={requests || []}
                        columns={columns}
                        getRowId={(row) => row.request_id}
                        initialState={{
                            pagination: {
                                paginationModel: { page: 0, pageSize: 10 },
                            },
                        }}
                        pageSizeOptions={[10, 25, 50]}
                        disableRowSelectionOnClick
                        loading={isLoading}
                        sx={{
                            border: 'none',
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(118, 185, 0, 0.1)'
                                        : 'rgba(118, 185, 0, 0.05)',
                                borderBottom: '2px solid',
                                borderColor: 'primary.main',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 700,
                            },
                            '& .MuiDataGrid-row': {
                                transition: 'all 0.2s ease',
                                '&:nth-of-type(odd)': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(255, 255, 255, 0.02)'
                                            : 'rgba(0, 0, 0, 0.02)',
                                },
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? 'rgba(118, 185, 0, 0.08)'
                                            : 'rgba(118, 185, 0, 0.05)',
                                    transform: 'scale(1.005)',
                                    boxShadow: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? '0 4px 12px rgba(118, 185, 0, 0.15)'
                                            : '0 2px 8px rgba(0, 0, 0, 0.08)',
                                },
                            },
                            '& .MuiDataGrid-cell': {
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                            },
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: '2px solid',
                                borderColor: 'divider',
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(0, 0, 0, 0.2)'
                                        : 'rgba(0, 0, 0, 0.02)',
                            },
                        }}
                    />
                </Paper>

                <RequestDetailModal
                    open={!!selectedRequest}
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                />
            </Box>
        </AnimatedPage>
    );
}
