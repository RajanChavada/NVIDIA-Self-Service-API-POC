import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Stepper,
    Step,
    StepLabel,
    Button,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

const steps = ['Pending', 'Provisioning', 'Completed'];

const getActiveStep = (status: string) => {
    switch (status) {
        case 'pending':
            return 0;
        case 'provisioning':
            return 1;
        case 'completed':
            return 2;
        case 'failed':
            return 2;
        default:
            return 0;
    }
};

export default function StatusCard() {
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    // Query to get all requests and find the most recent active one
    const { data: allRequests } = useQuery({
        queryKey: ['requests'],
        queryFn: api.getRequests,
        refetchInterval: 5000,
    });

    // Find the most recent non-completed request
    useEffect(() => {
        if (allRequests && allRequests.length > 0) {
            const activeReq = allRequests.find(
                (req) => req.status === 'pending' || req.status === 'provisioning'
            );
            if (activeReq) {
                setActiveRequestId(activeReq.request_id);
            } else {
                // Show the most recent request
                setActiveRequestId(allRequests[0].request_id);
            }
        }
    }, [allRequests]);

    // Poll the active request
    const { data: request, isLoading } = useQuery({
        queryKey: ['request', activeRequestId],
        queryFn: () => api.getRequest(activeRequestId!),
        enabled: !!activeRequestId,
        refetchInterval: (query) => {
            const status = query.state.data?.status;
            // Stop polling if completed or failed
            return status === 'completed' || status === 'failed' ? false : 3000;
        },
    });

    const handleDownloadKubeconfig = () => {
        if (request?.kubeconfig) {
            const blob = new Blob([request.kubeconfig], { type: 'text/yaml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kubeconfig-${request.request_id}.yaml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    if (!activeRequestId) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Request Status
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No active requests. Submit a request to get started.
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                </CardContent>
            </Card>
        );
    }

    if (!request) {
        return null;
    }

    const activeStep = getActiveStep(request.status);

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Request Status
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Request ID: {request.request_id}
                </Typography>

                {request.status === 'failed' && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Request failed. Please try again.
                    </Alert>
                )}

                <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Status:</strong> {request.status}
                    </Typography>
                    <Typography variant="body2">
                        <strong>GPU Count:</strong> {request.gpu_count}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Duration:</strong> {request.duration_hours}h
                    </Typography>
                    {request.created_at && (
                        <Typography variant="body2">
                            <strong>Created:</strong> {new Date(request.created_at).toLocaleString()}
                        </Typography>
                    )}
                </Box>

                {request.status === 'completed' && request.kubeconfig && (
                    <Button
                        variant="contained"
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadKubeconfig}
                    >
                        Download Kubeconfig
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
