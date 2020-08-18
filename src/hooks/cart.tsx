/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@products');

      if (data) setProducts(JSON.parse(data));
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      if (products.find(x => x.id === product.id))
        setProducts(
          products.map(x =>
            x.id !== product.id ? x : { ...x, quantity: x.quantity += 1 },
          ),
        );
      else
        setProducts(p => [
          ...p,
          {
            ...product,
            quantity: 1,
          },
        ]);

      AsyncStorage.setItem('@products', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(async id => {
    setProducts(p =>
      p.map(x => (x.id === id ? { ...x, quantity: x.quantity += 1 } : x)),
    );

    AsyncStorage.setItem('@products', JSON.stringify(products));
  }, []);

  const decrement = useCallback(
    async id => {
      if (products.find(x => x.id === id)?.quantity === 1)
        setProducts(products.filter(x => x.id !== id));
      else
        setProducts(p =>
          p.map(x => (x.id === id ? { ...x, quantity: x.quantity -= 1 } : x)),
        );

      AsyncStorage.setItem('@products', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
