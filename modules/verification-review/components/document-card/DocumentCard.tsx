import Image from 'next/image';

type DocumentCardProps = {
  label: string;
  imageUrl: string;
};

export default function DocumentCard({ label, imageUrl }: DocumentCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="aspect-4/3 bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl}
          alt={label}
          className="h-full w-full object-cover"
          width={500}
          height={500}
        />
      </div>
      <div className="px-2 py-1.5">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}
        </p>
      </div>
    </div>
  );
}
