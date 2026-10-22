export type Role = 'customer' | 'restaurant' | 'driver' | 'admin';

export type OrderStatus = 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered';

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta: number;
  deliveryFee: number;
  image: string;
  tags: string[];
  open: boolean;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  dietary: string[];
  modifiers: string[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  restaurant: string;
  customer: string;
  status: OrderStatus;
  total: number;
  eta: string;
};

export type DriverTrip = {
  id: string;
  customer: string;
  pickup: string;
  dropoff: string;
  eta: string;
  distance: string;
};
