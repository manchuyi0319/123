/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Microsoft YaHei"', '"Hiragino Sans GB"', '"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'level-up': 'levelUp 0.6s ease-out',
        'glow-legendary': 'glow-legendary 2.5s ease-in-out infinite',
        'glow-epic': 'glow-epic 2.5s ease-in-out infinite',
        'glow-rare': 'glow-rare 2.5s ease-in-out infinite',
        'pet-bounce': 'pet-bounce 1.5s ease-in-out infinite',
        'pet-wiggle': 'pet-wiggle 0.6s ease-in-out infinite',
        'pet-pop-in': 'pet-pop-in 0.5s ease-out',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'spotlight': 'spotlight 3s ease-in-out infinite',
        'card-hover': 'card-hover 0.3s ease-out',
        'status-pulse': 'status-pulse 1.5s ease-in-out infinite',
        'confetti-fall': 'confetti-fall 2s ease-out forwards',
        'level-transition': 'level-transition 0.8s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        levelUp: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        'glow-legendary': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(250,204,21,0.5), 0 0 20px rgba(250,204,21,0.2)' },
          '50%': { boxShadow: '0 0 16px rgba(250,204,21,0.8), 0 0 35px rgba(250,204,21,0.4)' },
        },
        'glow-epic': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(168,85,247,0.5), 0 0 15px rgba(168,85,247,0.2)' },
          '50%': { boxShadow: '0 0 12px rgba(168,85,247,0.7), 0 0 28px rgba(168,85,247,0.35)' },
        },
        'glow-rare': {
          '0%, 100%': { boxShadow: '0 0 4px rgba(59,130,246,0.4), 0 0 10px rgba(59,130,246,0.15)' },
          '50%': { boxShadow: '0 0 8px rgba(59,130,246,0.6), 0 0 20px rgba(59,130,246,0.3)' },
        },
        'pet-bounce': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '15%': { transform: 'translateY(-15px) scale(1.05)' },
          '30%': { transform: 'translateY(0) scale(1)' },
          '45%': { transform: 'translateY(-7px) scale(1.02)' },
          '60%': { transform: 'translateY(0) scale(1)' },
        },
        'pet-wiggle': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-5deg)' },
          '75%': { transform: 'rotate(5deg)' },
        },
        'pet-pop-in': {
          '0%': { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '60%': { transform: 'scale(1.2) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(250,204,21,0.4), 0 0 10px rgba(250,204,21,0.1)' },
          '50%': { boxShadow: '0 0 20px rgba(250,204,21,0.8), 0 0 40px rgba(250,204,21,0.3)' },
        },
        'spotlight': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        },
        'card-hover': {
          '0%': { transform: 'translateY(0) scale(1)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
          '100%': { transform: 'translateY(-4px) scale(1.02)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
        },
        'status-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(0) rotate(0deg) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-150px) rotate(720deg) scale(0)', opacity: '0' },
        },
        'level-transition': {
          '0%': { transform: 'scale(1)', filter: 'brightness(1)' },
          '30%': { transform: 'scale(1.2)', filter: 'brightness(1.5)' },
          '60%': { transform: 'scale(0.9)', filter: 'brightness(1.2)' },
          '100%': { transform: 'scale(1)', filter: 'brightness(1)' },
        },
      },
    },
  },
  plugins: [],
};
