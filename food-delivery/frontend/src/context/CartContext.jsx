import { createContext, useState, useCallback } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartRestaurant, setCartRestaurant] = useState(null);

  // Add item to cart
  const addToCart = useCallback((item, restaurant) => {
    // 🔥 Key rule — prevent adding from multiple restaurants
    if (cartRestaurant && cartRestaurant._id !== restaurant._id) {
      return {
        success: false,
        message: `You already have items from ${cartRestaurant.name}. Clear cart to order from ${restaurant.name}.`,
      };
    }

    // Set restaurant if cart is empty
    if (!cartRestaurant) {
      setCartRestaurant(restaurant);
    }

    setCartItems((prev) => {
      const exists = prev.find((i) => i._id === item._id);
      if (exists) {
        // Increase quantity if item already in cart
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      // Add new item with quantity 1
      return [...prev, { ...item, quantity: 1 }];
    });

    return { success: true };
  }, [cartRestaurant]);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((i) => i._id !== itemId);
      // If cart is empty, clear restaurant too
      if (updated.length === 0) {
        setCartRestaurant(null);
      }
      return updated;
    });
  }, []);

  // Increase quantity
  const increaseQuantity = useCallback((itemId) => {
    setCartItems((prev) =>
      prev.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }, []);

  // Decrease quantity
  const decreaseQuantity = useCallback((itemId) => {
    setCartItems((prev) => {
      const updated = prev.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter((i) => i.quantity > 0); // remove if quantity reaches 0

      if (updated.length === 0) {
        setCartRestaurant(null);
      }
      return updated;
    });
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
    setCartRestaurant(null);
  }, []);

  // Calculate total amount
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Total number of items
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Prepare items for order API
  const getOrderPayload = () => {
    return cartItems.map((item) => ({
      menuItemId: item._id,
      quantity: item.quantity,
    }));
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartRestaurant,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalAmount,
        totalItems,
        getOrderPayload,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};