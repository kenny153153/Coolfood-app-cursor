
import { Category, Product, OrderStatus, Order, Recipe } from './types';

export const CATEGORIES: Category[] = [
  { id: 'hot', name: '店長推介', icon: '🔥' },
  { id: 'beef', name: '頂級牛肉', icon: '🥩' },
  { id: 'pork', name: '黑豚系列', icon: '🥓' },
  { id: 'seafood', name: '環球海鮮', icon: '🦐' },
  { id: 'hotpot', name: '火鍋配料', icon: '🍢' },
  { id: 'snacks', name: '炸物小食', icon: '🍗' },
];

const BEEF_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: '香煎蒜片肉眼牛扒',
    imageUrl: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800&auto=format&fit=crop',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    ingredients: ['肉眼牛扒 300g', '大蒜 3瓣', '迷迭香 1枝', '牛油 20g'],
    steps: [
      '牛扒室溫退冰30分鐘，抹乾水分。',
      '兩面均勻撒上黑胡椒和鹽。',
      '大火燒熱油鍋，每面煎約2分鐘。',
      '加入牛油、大蒜及迷迭香淋汁，靜置5分鐘。'
    ]
  },
  {
    id: 'r1-2',
    title: '紅酒燉牛肉',
    imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?q=80&w=800&auto=format&fit=crop',
    ingredients: ['肉眼牛扒 300g (切塊)', '紅酒 200ml', '洋蔥 1個', '紅蘿蔔 1條'],
    steps: [
      '牛肉切塊，裹上薄薄麵粉。',
      '大火煎至表面金黃。',
      '加入蔬菜及紅酒慢火燉煮2小時。',
      '直到肉質酥軟。'
    ]
  }
];

const SEAFOOD_RECIPES: Recipe[] = [
  {
    id: 'r2',
    title: '牛油香煎帶子',
    imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=800&auto=format&fit=crop',
    ingredients: ['北海道帶子 4粒', '無鹽牛油 15g', '檸檬汁 少許', '海鹽 少許'],
    steps: [
      '帶子退冰後徹底印乾。',
      '鍋熱後下油，大火煎帶子一面。',
      '煎至底部焦黃，翻面加入牛油。',
      '擠入檸檬汁即可上碟。'
    ]
  },
  {
    id: 'r2-2',
    title: '帶子刺身沙律',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    ingredients: ['北海道帶子 4粒', '雜錦生菜 1碗', '芝麻醬 2湯匙'],
    steps: [
      '將帶子橫切成薄片。',
      '鋪在洗淨的沙律菜上。',
      '淋上芝麻醬及少量魚子醬裝飾。'
    ]
  }
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 'p1', 
    categories: ['beef'], 
    name: '美國 Prime 級肉眼 (300g)', 
    price: 128, 
    memberPrice: 108, 
    stock: 25, 
    trackInventory: true,
    tags: ['熱賣', '厚切'], 
    image: '🥩',
    origin: '美國',
    weight: '300g',
    description: '嚴選美國 Prime 級別，肉質鮮嫩，油花分佈均勻。',
    gallery: ['🥩', '🥘', '🔥'],
    recipes: BEEF_RECIPES,
    bulkDiscount: { threshold: 3, type: 'percent', value: 10 }
  },
  { 
    id: 'p2', 
    categories: ['seafood'], 
    name: '日本北海道帶子 (500g)', 
    price: 288, 
    memberPrice: 260, 
    stock: 12, 
    trackInventory: true,
    tags: ['刺身', '鮮甜'], 
    image: '🐚', 
    origin: '日本',
    weight: '500g',
    recipes: SEAFOOD_RECIPES,
    bulkDiscount: { threshold: 2, type: 'fixed', value: 250 }
  },
  { 
    id: 'p3', 
    categories: ['hot'], 
    name: '巴西急凍雞中翼 (2kg)', 
    price: 88, 
    memberPrice: 78, 
    stock: 120, 
    trackInventory: true,
    tags: ['家常', '超值'], 
    image: '🍗', 
    origin: '巴西',
    weight: '2kg',
    recipes: [
      {
        id: 'r3',
        title: '蒜香蜜汁烤雞翼',
        imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?q=80&w=800&auto=format&fit=crop',
        ingredients: ['雞中翼 10隻', '蜂蜜 2湯匙', '蒜茸 1湯匙'],
        steps: ['醃製雞翼2小時', '放入氣炸鍋180度烤15分鐘', '刷上蜂蜜再烤2分鐘。']
      }
    ]
  },
  { 
    id: 'p4', 
    categories: ['pork', 'hotpot'], 
    name: '黑毛豬梅頭片 (300g)', 
    price: 98, 
    memberPrice: 88, 
    stock: 30, 
    trackInventory: true,
    tags: ['火鍋', '黑豚'], 
    image: '🥓', 
    origin: '西班牙',
    weight: '300g',
    bulkDiscount: { threshold: 5, type: 'percent', value: 15 },
    recipes: [
      {
        id: 'r4',
        title: '生薑燒豬肉片',
        imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
        ingredients: ['黑豚梅頭片 150g', '生薑 1塊', '洋蔥 半個'],
        steps: ['洋蔥切絲炒軟', '下豬肉片炒至轉色', '加入生薑泥及醬油調味。']
      }
    ]
  },
  { 
    id: 'p5', 
    categories: ['seafood'], 
    name: '急凍大虎蝦 (8隻)', 
    price: 168, 
    memberPrice: 148, 
    stock: 5, 
    trackInventory: true,
    tags: ['海鮮', '爽口'], 
    image: '🦐', 
    origin: '越南',
    weight: '約400g',
    recipes: [
      {
        id: 'r5',
        title: '蒜蓉牛油大蝦',
        imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop',
        ingredients: ['大虎蝦 8隻', '牛油 20g', '蒜茸 大量'],
        steps: ['將蝦背切開去腸', '舖上蒜茸及牛油', '放入焗爐200度焗8分鐘。']
      }
    ]
  },
  { 
    id: 'p7', 
    categories: ['hotpot'], 
    name: '手打墨魚滑 (150g)', 
    price: 48, 
    memberPrice: 42, 
    stock: 60, 
    trackInventory: true,
    tags: ['火鍋', '爽彈'], 
    image: '🦑', 
    origin: '本地'
  },
];

export const MOCK_ORDERS: Order[] = [
  { id: 'ORD-8821', customerName: '陳大文', total: 456, status: OrderStatus.PENDING_PAYMENT, date: '2024-05-12', items: 3 },
  { id: 'ORD-8823', customerName: '張志明', total: 220, status: OrderStatus.SHIPPING, date: '2024-05-11', items: 2, trackingNumber: 'SF123456789' },
];

/** @deprecated 已遷移至 sfColdPickupPoints.ts，此處保留空陣列以避免 import 破損 */
export const SF_LOCKERS: { code: string; address: string }[] = [];

export const HK_DISTRICTS = [
  '香港島',
  '中西區',
  '灣仔區',
  '東區',
  '南區',
  '九龍',
  '油尖旺區',
  '深水埗區',
  '九龍城區',
  '黃大仙區',
  '觀塘區',
  '新界',
  '荃灣區',
  '屯門區',
  '元朗區',
  '北區',
  '大埔區',
  '西貢區',
  '沙田區',
  '葵青區',
  '離島區',
];
