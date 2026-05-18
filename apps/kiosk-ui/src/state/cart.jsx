import React, { createContext, useContext, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const { item } = action;
      const existing = state.items[item.id] || { item, qty: 0 };
      return {
        ...state,
        items: {
          ...state.items,
          [item.id]: { item, qty: existing.qty + 1 }
        }
      };
    }
    case "INC": {
      const { itemId } = action;
      const existing = state.items[itemId];
      if (!existing) return state;
      return { ...state, items: { ...state.items, [itemId]: { ...existing, qty: existing.qty + 1 } } };
    }
    case "DEC": {
      const { itemId } = action;
      const existing = state.items[itemId];
      if (!existing) return state;
      const nextQty = existing.qty - 1;
      const nextItems = { ...state.items };
      if (nextQty <= 0) delete nextItems[itemId];
      else nextItems[itemId] = { ...existing, qty: nextQty };
      return { ...state, items: nextItems };
    }
    case "CLEAR":
      return { items: {} };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: {} });

  const api = useMemo(() => {
    const list = Object.values(state.items);
    const total = list.reduce((sum, x) => sum + x.qty * x.item.pricePoints, 0);
    return { state, dispatch, list, total };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
