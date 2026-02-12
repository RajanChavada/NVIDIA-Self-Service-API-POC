import { motion } from 'framer-motion';
import { Box } from '@mui/material';

interface LogoProps {
    collapsed?: boolean;
}

export default function Logo({ collapsed = false }: LogoProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
        >
            <Box
                component="img"
                src="/images/nvidia-logo.png"
                alt="NVIDIA"
                sx={{
                    width: collapsed ? 40 : 140,
                    height: 'auto',
                    transition: 'width 0.3s ease',
                    filter: 'brightness(1.1)',
                }}
            />
        </motion.div>
    );
}
