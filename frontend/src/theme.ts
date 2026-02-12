import { createTheme, type PaletteMode } from '@mui/material/styles';

// NVIDIA-inspired color palette
const nvidiaGreen = '#76B900';
const nvidiaCyan = '#00D4AA';
const nvidiaOrange = '#FF9800';

export const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
        mode,
        ...(mode === 'dark'
            ? {
                // Dark theme (default)
                primary: {
                    main: nvidiaGreen,
                    light: '#8FD91F',
                    dark: '#5A8F00',
                    contrastText: '#000000',
                },
                secondary: {
                    main: nvidiaCyan,
                    light: '#33E0C0',
                    dark: '#00A888',
                    contrastText: '#000000',
                },
                background: {
                    default: '#0A0A0A',
                    paper: '#1A1A1A',
                },
                text: {
                    primary: '#FFFFFF',
                    secondary: '#B0B0B0',
                },
                success: {
                    main: '#4CAF50',
                },
                warning: {
                    main: nvidiaOrange,
                },
                error: {
                    main: '#F44336',
                },
                divider: 'rgba(118, 185, 0, 0.12)',
            }
            : {
                // Light theme
                primary: {
                    main: nvidiaGreen,
                    light: '#8FD91F',
                    dark: '#5A8F00',
                    contrastText: '#FFFFFF',
                },
                secondary: {
                    main: nvidiaCyan,
                    light: '#33E0C0',
                    dark: '#00A888',
                    contrastText: '#FFFFFF',
                },
                background: {
                    default: '#F5F5F5',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#1A1A1A',
                    secondary: '#666666',
                },
                success: {
                    main: '#4CAF50',
                },
                warning: {
                    main: nvidiaOrange,
                },
                error: {
                    main: '#F44336',
                },
                divider: 'rgba(0, 0, 0, 0.12)',
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 500,
        },
        h6: {
            fontWeight: 500,
        },
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    ...(mode === 'dark'
                        ? {
                            background: 'rgba(26, 26, 26, 0.7)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(118, 185, 0, 0.3)',
                            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
                        }
                        : {
                            background: 'rgba(255, 255, 255, 0.8)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            border: '1px solid rgba(118, 185, 0, 0.2)',
                            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.5)',
                        }),
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: mode === 'dark'
                            ? '0 4px 20px rgba(118, 185, 0, 0.4)'
                            : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                },
                contained: {
                    boxShadow: 'none',
                },
            },
        },
        MuiSlider: {
            styleOverrides: {
                root: {
                    height: 8,
                },
                thumb: {
                    height: 24,
                    width: 24,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: mode === 'dark'
                            ? '0 0 0 8px rgba(118, 185, 0, 0.16)'
                            : '0 0 0 8px rgba(118, 185, 0, 0.12)',
                    },
                    '&.Mui-active': {
                        boxShadow: mode === 'dark'
                            ? '0 0 0 14px rgba(118, 185, 0, 0.16)'
                            : '0 0 0 14px rgba(118, 185, 0, 0.12)',
                    },
                },
                track: {
                    height: 8,
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${nvidiaGreen} 0%, ${nvidiaCyan} 100%)`,
                },
                rail: {
                    height: 8,
                    borderRadius: 4,
                    opacity: 0.3,
                },
                valueLabel: {
                    backgroundColor: nvidiaGreen,
                    borderRadius: 4,
                    padding: '4px 8px',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 10,
                    borderRadius: 5,
                },
                bar: {
                    borderRadius: 5,
                    background: `linear-gradient(90deg, ${nvidiaGreen} 0%, ${nvidiaCyan} 100%)`,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    ...(mode === 'dark'
                        ? {
                            background: 'rgba(20, 20, 20, 0.85)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            borderRight: '1px solid rgba(118, 185, 0, 0.25)',
                        }
                        : {
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                        }),
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    ...(mode === 'dark'
                        ? {
                            background: 'rgba(20, 20, 20, 0.85)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            borderBottom: '1px solid rgba(118, 185, 0, 0.25)',
                        }
                        : {
                            background: 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        }),
                },
            },
        },
    },
});

export const createAppTheme = (mode: PaletteMode) => {
    return createTheme(getDesignTokens(mode));
};
