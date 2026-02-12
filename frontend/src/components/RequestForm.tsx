import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Box,
    Alert,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function RequestForm() {
    const [gpuCount, setGpuCount] = useState(4);
    const [duration, setDuration] = useState(2);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const createRequestMutation = useMutation({
        mutationFn: api.createRequest,
        onSuccess: (data) => {
            setSuccess(`Request created successfully! ID: ${data.request_id}`);
            setError('');
            queryClient.invalidateQueries({ queryKey: ['requests'] });
            queryClient.invalidateQueries({ queryKey: ['activeRequest'] });
        },
        onError: (err: any) => {
            setError(err.response?.data?.detail || 'Failed to create request');
            setSuccess('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('User not authenticated');
            return;
        }

        createRequestMutation.mutate({
            user_id: user.username,
            gpu_count: gpuCount,
            duration_hours: duration,
        });
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Request GPU Resources
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Submit a request for ephemeral GPU infrastructure
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 4 }}>
                        <Typography gutterBottom>
                            GPU Count: {gpuCount}
                        </Typography>
                        <Slider
                            value={gpuCount}
                            onChange={(_, value) => setGpuCount(value as number)}
                            min={1}
                            max={8}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Duration</InputLabel>
                        <Select
                            value={duration}
                            label="Duration"
                            onChange={(e) => setDuration(e.target.value as number)}
                        >
                            <MenuItem value={1}>1 hour</MenuItem>
                            <MenuItem value={2}>2 hours</MenuItem>
                            <MenuItem value={4}>4 hours</MenuItem>
                            <MenuItem value={8}>8 hours</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={createRequestMutation.isPending}
                    >
                        {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
