import type {
  Dataset,
  RelatedDataConfig,
} from '../../types/dataset';
import type { Brand, CategoryTemplate } from '../../types/product';
import { SeededRng, type Rng } from '../rng';
import { DEFAULT_REFERENCE_TIME } from '../generationTime';
import { generateCustomers } from './customer';
import { generateOrders } from './order';
import { generateProducts } from './product';
import { generateReviews } from './review';

export interface DatasetConfig extends RelatedDataConfig {
  productCount: number;
  referenceTime?: string;
}

export const generateDataset = (
  category: CategoryTemplate,
  brands: Brand[],
  selectedBrandIds: string[],
  config: DatasetConfig,
  rng: Rng = new SeededRng(),
  now: Date = new Date(config.referenceTime ?? DEFAULT_REFERENCE_TIME),
): Dataset => {
  const products = generateProducts(
    category,
    brands,
    selectedBrandIds,
    config.productCount,
    rng,
  );
  const customers = generateCustomers(config.customerCount, rng, now);
  const { orders, orderLines } = generateOrders(
    customers,
    products,
    config.ordersPerCustomer,
    rng,
    now,
  );
  const reviews = generateReviews(
    config.reviewCount,
    products,
    customers,
    rng,
    now,
  );

  return {
    products,
    customers,
    orders,
    order_lines: orderLines,
    reviews,
  };
};
