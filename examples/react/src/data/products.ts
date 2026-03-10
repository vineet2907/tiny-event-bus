export const products = [
  { id: 1, name: 'Wireless Headphones', price: 59.99 },
  { id: 2, name: 'Mechanical Keyboard', price: 89.99 },
  { id: 3, name: 'USB-C Hub', price: 34.99 },
  { id: 4, name: 'Laptop Stand', price: 44.99 },
];

export type Product = (typeof products)[number];
