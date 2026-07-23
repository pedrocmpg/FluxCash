export const theme = {
  colors: {
    bgDark: '#09090b',
    bgCard: '#0f0f12',
    bgHover: '#18181c',
    border: '#202024',

    text: '#f2f2f3',
    textSecondary: '#8b8b93',

    primary: '#34d399',
    primaryHover: '#10b981',

    income: '#34d399',
    expense: '#f87171',
    investment: '#fbbf24',
    balance: '#60a5fa',

    neutral: '#8b8b93',

    success: '#34d399',
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
    sm: '0 1px 2px rgba(0,0,0,0.4)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 12px 32px rgba(0,0,0,0.45)',
    neon: '0 0 20px rgba(52, 211, 153, 0.25)',
  },

  categoryColors: {
    Alimentação: '#34d399',
    Transporte: '#60a5fa',
    Saúde: '#f87171',
    Educação: '#a78bfa',
    Lazer: '#fbbf24',
    Moradia: '#38bdf8',
    Investimento: '#34d399',
    Receita: '#6ee7b7',
    Outros: '#8b8b93',
  } as const,
};

export type Theme = typeof theme;
