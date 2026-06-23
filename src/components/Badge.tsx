const VARIANT_STYLES = {
	success: "bg-green-500/10 text-green-400 border-green-500/30",
	danger: "bg-red-500/10 text-red-400 border-red-500/30",
	neutral: "bg-white/5 text-white/60 border-white/15",
} as const;

interface BadgeProps {
	children: React.ReactNode;
	variant?: keyof typeof VARIANT_STYLES;
}

const Badge = ({ children, variant = "neutral" }: BadgeProps) => {
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${VARIANT_STYLES[variant]}`}
		>
			{children}
		</span>
	);
};

export default Badge;
