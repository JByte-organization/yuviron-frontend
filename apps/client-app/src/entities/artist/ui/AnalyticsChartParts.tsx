'use client';

import React from 'react';
import { useTheme } from '@/shared/lib/ThemeProvider';


export const CHART_COLORS = {
    accent:  '#00A6FF',
    accent2: '#7B61FF',
};

export const chartTooltipStyle = {
    contentStyle: {
        background: 'var(--client-surface)',
        border: '1px solid var(--client-border)',
        borderRadius: 8,
    },
    labelStyle: { color: 'var(--client-text)' },
};

export const useChartAxisColors = () => {
    const { theme } = useTheme();
    return theme === 'light'
        ? { grid: 'rgba(15,23,36,0.12)',    text: 'rgba(13,21,32,0.6)' }
        : { grid: 'rgba(119,145,178,0.15)', text: 'rgba(206,216,227,0.55)' };
};

export const errorStatus = (error: unknown): number | undefined =>
    (error as { response?: { status?: number } } | null)?.response?.status;

export const ChartSkeleton = ({ height = 260 }: { height?: number }) => (
    <div className="skeleton w-100" style={{ height, borderRadius: 12 }} />
);

export const ChartError = ({ error }: { error: unknown }) => {
    const status = errorStatus(error);
    const message = status === 403
        ? 'Недостатньо прав: ви не входите до команди цього артиста.'
        : status === 404
            ? 'Дані не знайдено.'
            : 'Не вдалося завантажити дані. Спробуйте пізніше.';
    return <div className="text-secondary py-4 text-center">{message}</div>;
};
