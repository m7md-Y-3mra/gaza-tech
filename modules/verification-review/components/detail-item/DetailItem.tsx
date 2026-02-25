type DetailItemProps = {
  label: string;
  value: string;
};

export default function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}
