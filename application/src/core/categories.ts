import { CategoryTemplate } from '../types/product';

export const PHONE_IMAGES = [
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800',
];

export const LAPTOP_IMAGES = [
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800',
];

export const AUDIO_IMAGES = [
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800',
];

export const CABLE_IMAGES = [
  'https://images.unsplash.com/photo-1492107376256-4026437926cd?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1607125516845-fa8a14db083a?auto=format&fit=crop&w=800',
  'https://images.unsplash.com/photo-1572721546624-05bf65ad7679?auto=format&fit=crop&w=800',
];

export const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    id: 'smartphones',
    name: 'Smartphones',
    slug: 'smartphones',
    skuPrefix: 'PHN',
    unsplashIds: PHONE_IMAGES,
    defaultBrands: ['Apple', 'Samsung', 'Google', 'OnePlus'],
    models: ['Phone'],
    variants: ['Mini', 'Pro', 'Ultra', 'X'],
    attributes: [
      {
        key: 'os',
        label: 'Operating System',
        type: 'select',
        options: ['iOS 17', 'Android 14'],
      },
      {
        key: 'storage',
        label: 'Storage',
        type: 'select',
        options: ['128GB', '256GB', '512GB'],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'select',
        options: ['Purple', 'Titanium', 'Midnight', 'Silver'],
      },
    ],
  },
  {
    id: 'laptops',
    name: 'Laptops',
    slug: 'laptops',
    skuPrefix: 'LAP',
    unsplashIds: LAPTOP_IMAGES,
    defaultBrands: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus'],
    models: [''],
    variants: ['Pro', 'Noob'],
    attributes: [
      {
        key: 'cpu',
        label: 'Processor',
        type: 'select',
        options: ['Intel i7', 'AMD Ryzen 7', 'M3'],
      },
      {
        key: 'ram',
        label: 'RAM',
        type: 'select',
        options: ['16GB', '32GB'],
      },
      {
        key: 'storage',
        label: 'Storage',
        type: 'select',
        options: ['512GB', '1TB'],
      },
      {
        key: 'screenSize',
        label: 'Screen Size',
        type: 'select',
        options: ['13 Inch', '14 Inch', '15 Inch', '16 Inch'],
      },
    ],
  },
  {
    id: 'audio',
    name: 'Audio',
    slug: 'audio',
    skuPrefix: 'AUD',
    unsplashIds: AUDIO_IMAGES,
    defaultBrands: ['Sony', 'Bose', 'JBL', 'Sennheiser'],
    models: [''],
    variants: ['Buds', 'Headphones'],
    attributes: [
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: ['True Wireless', 'Over-ear', 'In-ear'],
      },
      {
        key: 'wireless',
        label: 'Wireless',
        type: 'boolean',
      },
      {
        key: 'battery_life',
        label: 'Battery Life',
        type: 'select',
        options: ['20h', '30h', '40h'],
      },
    ],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    skuPrefix: 'ACC',
    unsplashIds: CABLE_IMAGES,
    defaultBrands: ['Anker', 'Belkin', 'Logi'],
    models: [''],
    variants: ['USB-C', 'HDMI', 'Lightning'],
    attributes: [
      {
        key: 'length',
        label: 'Length',
        type: 'select',
        options: ['1m', '2m', '3m'],
      },
      {
        key: 'compatibility',
        label: 'Compatibility',
        type: 'select',
        options: ['Universal', 'Windows', 'Mac'],
      },
    ],
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    skuPrefix: 'BOK',
    unsplashIds: [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800',
    ],
    defaultBrands: ['Penguin', 'HarperCollins', 'Simon & Schuster', 'Random House'],
    models: [''],
    variants: ['Hardcover', 'Paperback', 'E-book'],
    attributes: [
      {
        key: 'genre',
        label: 'Genre',
        type: 'select',
        options: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography'],
      },
      {
        key: 'pages',
        label: 'Pages',
        type: 'number',
        min: 100,
        max: 1000,
      },
      {
        key: 'language',
        label: 'Language',
        type: 'select',
        options: ['English', 'Spanish', 'French', 'German'],
      },
    ],
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    skuPrefix: 'CLT',
    unsplashIds: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800',
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800',
    ],
    defaultBrands: ['Nike', 'Adidas', 'Zara', 'H&M', 'Uniqlo'],
    models: ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers'],
    variants: ['Classic', 'Sport', 'Casual'],
    attributes: [
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        key: 'color',
        label: 'Color',
        type: 'select',
        options: ['Black', 'White', 'Blue', 'Red', 'Green'],
      },
      {
        key: 'material',
        label: 'Material',
        type: 'select',
        options: ['Cotton', 'Polyester', 'Wool', 'Leather'],
      },
    ],
  },
];

export const getCategoryById = (id: string): CategoryTemplate | undefined => {
  return CATEGORY_TEMPLATES.find((cat) => cat.id === id);
};

export const getDefaultCategory = (): CategoryTemplate => {
  return CATEGORY_TEMPLATES[0];
};
