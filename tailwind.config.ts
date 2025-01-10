import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",

    
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
	"./node_modules/react-tailwindcss-select/dist/index.esm.js"
	],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			'primary-black': '#1A232E',
  			'secondary-white': '#c7c7c7',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			blue: {
  				'1': '#0E78F9'
  			},
  			sky: {
  				'1': '#C9DDFF',
  				'2': '#ECF0FF',
  				'3': '#F5FCFF'
  			},
  			orange: {
  				'1': '#FF742E'
  			},
  			purple: {
  				'1': '#830EF9'
  			},
  			yellow: {
  				'1': '#F9A90E'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			customgreys: {
  				primarybg: '#1B1C22',
  				secondarybg: '#25262F',
  				darkGrey: '#17181D',
  				darkerGrey: '#3d3d3d',
  				dirtyGrey: '#6e6e6e'
  			},
  			primary: {
  				'50': '#fdfdff',
  				'100': '#f7f7ff',
  				'200': '#ececff',
  				'300': '#ddddfe',
  				'400': '#cacafe',
  				'500': '#b3b3fd',
  				'600': '#9898fd',
  				'700': '#7878fc',
  				'750': '#5a5be6',
  				'800': '#0404be',
  				'900': '#020255',
  				'950': '#010132',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				'50': '#fcfefe',
  				'100': '#f3fbfa',
  				'200': '#e5f7f4',
  				'300': '#d0f1ec',
  				'400': '#b6e9e1',
  				'500': '#96dfd4',
  				'600': '#70d3c4',
  				'700': '#44c5b2',
  				'800': '#227064',
  				'900': '#123933',
  				'950': '#0c2723',
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  		
  		},
  		transitionTimingFunction: {
  			'out-flex': 'cubic-bezier(0.05, 0.6, 0.4, 0.9)'
  		},
  	
  	}
  },
  plugins: [require("tailwindcss-animate"), "prettier-plugin-tailwindcss"],
} satisfies Config

export default config
