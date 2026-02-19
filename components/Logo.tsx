export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <span className={`font-bold tracking-wide ${sizes[size]}`}>
      <span style={{ color: 'var(--brand-green)' }}>[</span>
      <span style={{ color: 'var(--text-primary)' }}> Cadre </span>
      <span style={{ color: 'var(--brand-green)' }}>]</span>
    </span>
  );
}
