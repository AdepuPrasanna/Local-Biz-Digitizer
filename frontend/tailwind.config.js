/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eef2ff', 100:'#e0e7ff', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 900:'#312e81' },
        success: { 50:'#f0fdf4', 500:'#22c55e', 600:'#16a34a' },
        danger:  { 50:'#fef2f2', 500:'#ef4444', 600:'#dc2626' },
        warning: { 50:'#fffbeb', 500:'#f59e0b', 600:'#d97706' },
      }
    },
  },
  plugins: [],
}
