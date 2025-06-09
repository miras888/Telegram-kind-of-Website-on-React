
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      
      colors: {
        'primary-blue': 'var(--primary-blue)',
        'secondary-gray': 'var(--secondary-gray)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'border-color': 'var(--border-color)',
        'header-bg': 'var(--header-bg)',
        'header-text': 'var(--header-text)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'chat-bubble-me-bg': 'var(--chat-bubble-me-bg)',
        'chat-bubble-other-bg': 'var(--chat-bubble-other-bg)',
        'chat-time-text': 'var(--chat-time-text)',
      },
    },
  },
  plugins: [],
}