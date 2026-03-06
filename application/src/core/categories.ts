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
    models: ['15', 'Pro', 'Ultra', 'Mini', 'Max'],
    brandModels: {
      'Apple': ['iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 15 Plus', 'iPhone SE'],
      'Samsung': ['Galaxy S24', 'Galaxy S24+', 'Galaxy S24 Ultra', 'Galaxy Z Fold', 'Galaxy Z Flip'],
      'Google': ['Pixel 8', 'Pixel 8 Pro', 'Pixel 8a', 'Pixel Fold', 'Pixel Tablet'],
      'OnePlus': ['OnePlus 12', 'OnePlus 12R', 'OnePlus Open', 'OnePlus Nord', 'OnePlus 11'],
    },
    variants: ['Mini', 'Pro', 'Ultra', 'X'],
    priceRange: { min: 299, max: 1599 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'os',
        type: 'select',
        options: ['iOS 17', 'Android 14'],
      },
      {
        key: 'storage',
        type: 'select',
        options: ['128GB', '256GB', '512GB'],
      },
      {
        key: 'color',
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
    models: ['Pro', 'Air', 'Studio', 'Elite', 'Standard'],
    brandModels: {
      'Apple': ['MacBook Air', 'MacBook Pro 14', 'MacBook Pro 16', 'Mac Studio', 'Mac mini'],
      'Dell': ['XPS 13', 'XPS 15', 'Latitude', 'Inspiron', 'Alienware'],
      'HP': ['Spectre', 'Envy', 'Pavilion', 'EliteBook', 'Omen'],
      'Lenovo': ['ThinkPad X1', 'ThinkPad T', 'Yoga', 'Legion', 'IdeaPad'],
      'Asus': ['ZenBook', 'VivoBook', 'ROG', 'TUF', 'ProArt'],
    },
    variants: ['Pro', 'Noob'],
    priceRange: { min: 599, max: 3999 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'cpu',
        type: 'select',
        options: ['Intel i7', 'AMD Ryzen 7', 'M3'],
      },
      {
        key: 'ram',
        type: 'select',
        options: ['16GB', '32GB'],
      },
      {
        key: 'storage',
        type: 'select',
        options: ['512GB', '1TB'],
      },
      {
        key: 'screenSize',
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
    models: ['Over-Ear', 'In-Ear', 'Buds', 'Studio', 'Sport'],
    brandModels: {
      'Sony': ['WH-1000XM5', 'WF-1000XM5', 'LinkBuds', 'SRS-XB', 'HT-A'],
      'Bose': ['QuietComfort Ultra', 'QuietComfort', 'Sport Earbuds', 'SoundLink', 'Smart Speaker'],
      'JBL': ['Tune', 'Live', 'Quantum', 'Flip', 'Charge'],
      'Sennheiser': ['Momentum 4', 'Momentum True Wireless', 'HD 660S', 'IE 900', 'Ambeo'],
    },
    variants: ['Buds', 'Headphones'],
    priceRange: { min: 49, max: 499 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'type',
        type: 'select',
        options: ['True Wireless', 'Over-ear', 'In-ear'],
      },
      {
        key: 'wireless',
        type: 'boolean',
      },
      {
        key: 'battery_life',
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
    models: ['Cable', 'Hub', 'Adapter', 'Charger', 'Dock'],
    brandModels: {
      'Anker': ['PowerLine', 'PowerPort', 'PowerExpand', 'PowerCore', 'Soundcore'],
      'Belkin': ['BoostCharge', 'Connect', 'MagSafe', 'Thunderbolt', 'WeMo'],
      'Logi': ['MX Keys', 'MX Master', 'StreamCam', 'K380', 'C920'],
    },
    variants: ['USB-C', 'HDMI', 'Lightning'],
    priceRange: { min: 9, max: 299 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'length',
        type: 'select',
        options: ['1m', '2m', '3m'],
      },
      {
        key: 'compatibility',
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
    models: ['Hardcover', 'Paperback', 'E-book', 'Audiobook', 'Collector'],
    brandModels: {
      'Penguin': ['Classics', 'Modern Classics', 'Random House', 'Viking', 'Penguin Press'],
      'HarperCollins': ['Harper', 'William Morrow', 'Avon', 'Thomas Nelson', 'Zondervan'],
      'Simon & Schuster': ['Scribner', 'Atria', 'Gallery', 'Touchstone', 'Free Press'],
      'Random House': ['Knopf', 'Doubleday', 'Crown', 'Ballantine', 'Del Rey'],
    },
    variants: ['Hardcover', 'Paperback', 'E-book'],
    priceRange: { min: 9, max: 99 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'genre',
        type: 'select',
        options: ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Mystery', 'Biography'],
      },
      {
        key: 'pages',
        type: 'number',
        min: 100,
        max: 1000,
      },
      {
        key: 'language',
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
    models: ['T-Shirt', 'Jeans', 'Jacket', 'Sneakers', 'Hoodie'],
    brandModels: {
      'Nike': ['Air Force', 'Air Max', 'Dri-FIT', 'Tech Fleece', 'Pro'],
      'Adidas': ['Ultraboost', 'Stan Smith', 'Originals', 'Terrex', 'Essentials'],
      'Zara': ['Basic', 'Premium', 'Studio', 'Join Life', 'Origins'],
      'H&M': ['Conscious', 'Trend', 'Divided', 'Kids', 'Premium'],
      'Uniqlo': ['Heattech', 'Aerism', 'Ultra Light Down', 'Kando', 'U'],
    },
    variants: ['Classic', 'Sport', 'Casual'],
    priceRange: { min: 19, max: 599 },
    idFormat: 'uuid',
    attributes: [
      {
        key: 'size',
        type: 'select',
        options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      },
      {
        key: 'color',
        type: 'select',
        options: ['Black', 'White', 'Blue', 'Red', 'Green'],
      },
      {
        key: 'material',
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
