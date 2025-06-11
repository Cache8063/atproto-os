module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg, #000000)',
        'bg-contrast-25': 'var(--color-bgContrast25, #0a0a0a)',
        'bg-contrast-50': 'var(--color-bgContrast50, #1a1a1a)',
        text: 'var(--color-text, #ffffff)',
        'text-medium': 'var(--color-textMedium, #a3a3a3)',
        'text-low': 'var(--color-textLow, #737373)',
        border: 'var(--color-border, #262626)',
        primary: 'var(--color-primary, #1d4ed8)',
        secondary: 'var(--color-secondary, #ea580c)',
      },
    },
  },
  plugins: [],
}
