import type {
  CountRange,
  Customer,
  Order,
  OrderLine,
  OrderStatus,
} from '../../types/dataset';
import type { Product } from '../../types/product';
import { roundMoney } from '../money';
import type { Rng } from '../rng';

const MAX_LINES_PER_ORDER = 4;
const MAX_QUANTITY_PER_LINE = 3;
const CURRENCY = 'USD';

const ORDER_STATUS_WEIGHTS: ReadonlyArray<
  readonly [OrderStatus, number]
> = [
  ['delivered', 0.6],
  ['shipped', 0.15],
  ['paid', 0.1],
  ['pending', 0.1],
  ['cancelled', 0.05],
];

export interface GeneratedOrders {
  orders: Order[];
  orderLines: OrderLine[];
}

const normalizeRange = (range: CountRange): CountRange => {
  const min = Math.max(0, Math.floor(range.min));

  return {
    min,
    max: Math.max(min, Math.floor(range.max)),
  };
};

export const generateOrders = (
  customers: readonly Customer[],
  products: readonly Product[],
  ordersPerCustomer: CountRange,
  rng: Rng,
  now: Date = new Date(),
): GeneratedOrders => {
  const orders: Order[] = [];
  const orderLines: OrderLine[] = [];

  if (customers.length === 0 || products.length === 0) {
    return { orders, orderLines };
  }

  const range = normalizeRange(ordersPerCustomer);
  const maxLines = Math.min(MAX_LINES_PER_ORDER, products.length);

  for (const customer of customers) {
    const orderCount = rng.int(range.min, range.max);
    const customerCreatedAt = new Date(customer.created_at);
    const earliest = customerCreatedAt.getTime() <= now.getTime()
      ? customerCreatedAt
      : now;

    for (let index = 0; index < orderCount; index++) {
      const orderId = rng.uuid();
      const placedAt = rng.dateBetween(earliest, now);
      const selectedProducts = rng
        .shuffle(products)
        .slice(0, rng.int(1, maxLines));

      const lines: OrderLine[] = selectedProducts.map((product) => {
        const quantity = rng.int(1, MAX_QUANTITY_PER_LINE);

        return {
          id: rng.uuid(),
          order_id: orderId,
          product_id: product.id,
          quantity,
          unit_price: product.price,
          line_total: roundMoney(quantity * product.price),
        };
      });

      orders.push({
        id: orderId,
        customer_id: customer.id,
        status: rng.weighted(ORDER_STATUS_WEIGHTS),
        placed_at: placedAt.toISOString(),
        total: roundMoney(
          lines.reduce((sum, line) => sum + line.line_total, 0),
        ),
        currency: CURRENCY,
      });
      orderLines.push(...lines);
    }
  }

  return { orders, orderLines };
};
