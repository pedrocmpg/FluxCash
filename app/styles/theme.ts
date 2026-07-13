export const theme = {
  colors: {
    bgDark: '#0d1117',
    bgCard: '#161b22',
    bgHover: '#1c2128',
    border: '#30363d',

    text: '#e6edf3',
    textSecondary: '#8b949e',

    primary: '#4ade80',
    primaryHover: '#22c55e',

    income: '#22c55e',
    expense: '#f87171',
    investment: '#fbbf24',
    balance: '#60a5fa',

    neutral: '#8b949e',

    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },

  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  boxShadow: {
    sm: '0 2px 8px rgba(0,0,0,0.3)',
    md: '0 4px 16px rgba(0,0,0,0.4)',
    lg: '0 8px 32px rgba(0,0,0,0.5)',
    neon: '0 0 20px rgba(74, 222, 128, 0.3)',
  },

  categoryColors: {
    Alimentação: '#22c55e',
    Transporte: '#60a5fa',
    Saúde: '#f87171',
    Educação: '#a78bfa',
    Lazer: '#fbbf24',
    Moradia: '#38bdf8',
    Investimento: '#4ade80',
    Receita: '#34d399',
    Outros: '#8b949e',
  } as const,
};

export type Theme = typeof theme;
