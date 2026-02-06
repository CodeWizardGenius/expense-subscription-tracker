// ============================================================================
// tailwind.config.js
// ============================================================================
// Bu dosya NativeWind'in Tailwind CSS yapılandırmasıdır.
// Özel renkler, fontlar ve spacing değerleri burada tanımlanır.
// className="bg-primary" gibi kullanımlar için gerekli.

/** @type {import('tailwindcss').Config} */
module.exports = {
	// NativeWind preset'i - React Native için gerekli dönüşümleri sağlar
	presets: [require("nativewind/preset")],

	// Tailwind'in tarayacağı dosyalar
	// Bu path'lerdeki className kullanımları algılanır
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
	],

	theme: {
		extend: {
			// ================================================================
			// 🎨 ÖZEL RENKLER
			// ================================================================
			// Bu renkler className içinde kullanılabilir:
			// bg-primary, text-accent, border-card-bg gibi
			colors: {
				// Ana arka plan rengi
				primary: "#0a0e14",

				// Kart arka planları
				card: "#0d1a1a",
				"card-secondary": "#111b1b",

				// Vurgu rengi (turkuaz)
				accent: "#00f5e0",

				// Metin renkleri
				"text-primary": "#ffffff",
				"text-secondary": "#6b7280",
				"text-muted": "#9ca3af",

				// Grafik renkleri
				"chart-food": "#00f5e0",
				"chart-bills": "#a855f7",
				"chart-other": "#f97316",

				// Progress bar
				"progress-bg": "#1f2937",
				"progress-fill": "#3b82f6",

				// İşlem öğeleri
				"transaction-bg": "#111b1b",
			},

			// ================================================================
			// 📐 ÖZEL SPACING (İsteğe Bağlı)
			// ================================================================
			spacing: {
				18: "4.5rem", // 72px
				88: "22rem", // 352px
				128: "32rem", // 512px
			},

			// ================================================================
			// ⭕ ÖZEL BORDER RADIUS
			// ================================================================
			borderRadius: {
				"4xl": "2rem", // 32px
			},
		},
	},
	plugins: [],
};
