// ============================================================
// colors — Uygulamanın tek renk kaynağı.
//
// Tüm ekranlar rengi buradan alır; hiçbir dosyada doğrudan '#2271C4'
// gibi bir değer yazılmaz. Böylece tema tek yerden değiştirilebilir.
//
// blueTint10, borderLight50 gibi isimlerdeki sayı şeffaflık oranıdır
// (blueTint10 = %10 opaklıkta Yeditepe mavisi).
// ============================================================

export const colors = {
  yeditepeBlue: '#2271C4',

  background: '#F9F9FF',
  card: '#FFFFFF',

  textPrimary: '#191C21',
  textSecondary: '#6C757D',
  textTertiary: '#9AA1AF',
  textDark: '#1a1a1a',
  textMuted: '#666666',

  border: '#C1C6D3',
  inactive: '#6C757D',

  success: '#2E7D32',
  error: '#D32F2F',
  warning: '#D97706',
  info: '#2563EB',

  white: '#FFFFFF',
  black: '#000000',

  // Surface / Background variants
  surfaceLight: '#F2F3FB',
  surfaceMuted: '#E7E8F0',
  surfaceDivider: '#E1E4ED',
  surfaceHover: '#F0F2F7',

  // Semantic surface tints
  errorLight: '#FEE2E2',
  successLight: '#DCFCE7',

  // Opacity helpers (rgba based on core colors)
  blueTint05: 'rgba(34, 113, 196, 0.05)',
  blueTint08: 'rgba(34, 113, 196, 0.08)',
  blueTint10: 'rgba(34, 113, 196, 0.10)',
  blueTint12: 'rgba(34, 113, 196, 0.12)',
  blueTint14: 'rgba(34, 113, 196, 0.14)',
  blueTint16: 'rgba(34, 113, 196, 0.16)',
  blueTint18: 'rgba(34, 113, 196, 0.18)',
  blueTint20: 'rgba(34, 113, 196, 0.20)',
  blueTint22: 'rgba(34, 113, 196, 0.22)',

  borderLight12: 'rgba(193, 198, 211, 0.12)',
  borderLight22: 'rgba(193, 198, 211, 0.22)',
  borderLight24: 'rgba(193, 198, 211, 0.24)',
  borderLight25: 'rgba(193, 198, 211, 0.25)',
  borderLight30: 'rgba(193, 198, 211, 0.30)',
  borderLight35: 'rgba(193, 198, 211, 0.35)',
  borderLight38: 'rgba(193, 198, 211, 0.38)',
  borderLight45: 'rgba(193, 198, 211, 0.45)',
  borderLight50: 'rgba(193, 198, 211, 0.50)',
  borderLight55: 'rgba(193, 198, 211, 0.55)',
  borderLight85: 'rgba(193, 198, 211, 0.85)',

  successTint10: 'rgba(46, 125, 50, 0.10)',
  successTint12: 'rgba(46, 125, 50, 0.12)',

  errorTint08: 'rgba(211, 47, 47, 0.08)',
  errorTint10: 'rgba(211, 47, 47, 0.10)',
  errorTint50: 'rgba(211, 47, 47, 0.50)',

  warningTint10: 'rgba(217, 119, 6, 0.10)',
  warningTint12: 'rgba(217, 119, 6, 0.12)',
  warningTint14: 'rgba(217, 119, 6, 0.14)',
  warningTint18: 'rgba(217, 119, 6, 0.18)',

  whiteAlpha12: 'rgba(255,255,255,0.12)',
  whiteAlpha20: 'rgba(255,255,255,0.20)',
  whiteAlpha86: 'rgba(255,255,255,0.86)',
};
