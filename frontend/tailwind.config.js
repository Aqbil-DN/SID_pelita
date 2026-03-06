/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#327169',
                'primary-dark': '#275c54',
                'primary-light': '#3d8579',
                secondary: '#438c81',
                'secondary-light': '#52a396',
                tertiary: '#4d4d4d',
                accent: '#a3c7c7',
                'accent-light': '#c8e0e0',
                'accent-dark': '#7aacac',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
