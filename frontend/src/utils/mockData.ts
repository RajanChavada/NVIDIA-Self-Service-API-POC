import type { RequestResponse } from '../services/api';

// Generate mock request data for dashboard widgets
export const generateMockRequests = (count: number = 5): RequestResponse[] => {
    const statuses: Array<'pending' | 'provisioning' | 'completed' | 'failed'> = [
        'completed',
        'completed',
        'provisioning',
        'pending',
        'failed',
    ];

    const now = new Date();

    return Array.from({ length: count }, (_, i) => {
        const status = statuses[i] || 'completed';
        const createdAt = new Date(now.getTime() - (i + 1) * 3600000); // Hours ago
        const completedAt =
            status === 'completed'
                ? new Date(createdAt.getTime() + 300000) // 5 minutes later
                : null;

        return {
            request_id: `mock-${i + 1}-${Math.random().toString(36).substring(7)}`,
            user_id: 'testuser',
            gpu_count: [2, 4, 8, 1, 4][i] || 4,
            duration_hours: [2, 4, 1, 8, 2][i] || 2,
            status,
            kubeconfig: status === 'completed' ? 'apiVersion: v1\nkind: Config\n...' : undefined,
            error_msg: status === 'failed' ? 'Insufficient GPU resources' : undefined,
            created_at: createdAt.toISOString(),
            completed_at: completedAt?.toISOString() || undefined,
        };
    });
};

export const MOCK_REQUESTS = generateMockRequests(5);
