import { formatPrice, formatPriceEUR } from '@/lib/utils';

interface Props {
  price: number;
  className?: string;
  showOldPrice?: boolean;
  oldPrice?: number | null;
}

export default function PriceDisplay({ price, className = '', showOldPrice = false, oldPrice }: Props) {
  return (
    <div className={className}>
      {showOldPrice && oldPrice && oldPrice > price && (
        <div className="mb-1">
          <p className="text-gray-400 line-through text-xl">
            {formatPrice(oldPrice)}
          </p>
          <p className="text-gray-400 line-through text-sm">
            {formatPriceEUR(oldPrice)}
          </p>
        </div>
      )}
      <div>
        <p className="text-primary text-4xl font-bold">
          {formatPrice(price)}
        </p>
        <p className="text-primary/70 text-lg mt-1">
          {formatPriceEUR(price)}
        </p>
      </div>
    </div>
  );
}
