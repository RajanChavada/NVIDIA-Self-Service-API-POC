import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { type PaletteMode } from '@mui/material';

interface ThemeModeContextType {
    mode: PaletteMode;
    toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType>({
    mode: 'dark',
    toggleTheme: () => { },
});

export const useThemeMode = () => useContext(ThemeModeContext);

interface ThemeModeProviderProps {
    children: ReactNode;
}

export function ThemeModeProvider({ children }: ThemeModeProviderProps) {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const saved = localStorage.getItem('themeMode');
        return (saved as PaletteMode) || 'dark';
    });

    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'dark' ? 'light' : 'dark';
            localStorage.setItem('themeMode', newMode);
            return newMode;
        });
    };

    const value = useMemo(
        () => ({
            mode,
            toggleTheme,
        }),
        [mode]
    );

    return (
        <ThemeModeContext.Provider value={value}>
            {children}
        </ThemeModeContext.Provider>
    );
}
