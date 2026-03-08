const InfoBanner = ({
  variant,
  children,
}: {
  variant: 'blue' | 'amber' | 'green';
  children: React.ReactNode;
}) => {
  const colors = {
    blue: 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-950/30 dark:text-blue-200',
    amber:
      'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200',
    green:
      'border-green-500 bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-200',
  }[variant];

  return (
    <div className={`rounded-lg border-l-4 p-4 ${colors}`}>
      <p className="text-sm">{children}</p>
    </div>
  );
};

export default InfoBanner;
