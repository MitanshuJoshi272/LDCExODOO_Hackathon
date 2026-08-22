export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1C1A17',
          soft: '#4A453D',
          muted: '#847B6E',
        },
        paper: {
          DEFAULT: '#FBF8F3',
          raised: '#FFFFFF',
          sunk: '#F3EDE3',
        },
        line: {
          DEFAULT: '#E7DFD2',
          strong: '#D6CBB8',
        },
        clay: {
          DEFAULT: '#B9502A',
          soft: '#F6E4DA',
          deep: '#8C3A1B',
        },
        pine: {
          DEFAULT: '#1F4D45',
          soft: '#DDE8E5',
        },
        gold: {
          DEFAULT: '#B48420',
          soft: '#F7EDD4',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,26,23,0.04), 0 8px 24px -12px rgba(28,26,23,0.16)',
        lift: '0 2px 4px rgba(28,26,23,0.05), 0 18px 40px -20px rgba(28,26,23,0.28)',
      },
    },
  },
  plugins: [],
}
