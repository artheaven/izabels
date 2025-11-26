import { formatPrice, formatPriceEUR } from '@/lib/utils';

interface Props {
  price: number;
  className?: string;
  oldPrice?: number | null;
  showDiscount?: boolean;
}

export default function PriceDisplaySmall({ price, className = '', oldPrice, showDiscount = false }: Props) {
  const hasDiscount = oldPrice && oldPrice > price;

  return (
    <div className={className}>
      {hasDiscount && showDiscount && (
        <div className="mb-1">
          <span className="text-gray-400 line-through text-sm block">
            {formatPrice(oldPrice)}
          </span>
        </div>
      )}
      <div>
        <span className="text-primary font-bold block">
          {formatPrice(price)}
        </span>
        <span className="text-primary/70 text-xs block">
          {formatPriceEUR(price)}
        </span>
      </div>
    </div>
  );
}

