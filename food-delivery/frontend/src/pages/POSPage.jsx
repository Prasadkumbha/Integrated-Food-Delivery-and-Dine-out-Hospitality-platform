import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setOnlineStatus } from "../features/network/networkSlice";
import {
  addToCart,
  removeFromCart,
  increaseQty,
  decreaseQty,
  clearCart,
  calculateTotals,
} from "../features/cart/cartSlice";
import { fetchProducts } from "../features/products/productSlice";
import { createOrder } from "../features/orders/orderSlice";

function POSPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, subtotal, discount, tax, total } = useSelector(
    (state) => state.cart
  );
  const { online } = useSelector((state) => state.network);
  const { items: products, loading, error } = useSelector(
    (state) => state.products
  );
  const {
    loading: orderLoading,
    error: orderError,
    success: orderSuccess,
  } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");

  const searchInputRef = useRef(null);
  const barcodeInputRef = useRef(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const handleBarcodeSubmit = () => {
    const scanned = barcodeInput.trim().toLowerCase();
    const matchedProduct = products.find((product) =>
      product.name.toLowerCase().includes(scanned)
    );

    if (matchedProduct) {
      dispatch(addToCart(matchedProduct));
    }

    setBarcodeInput("");
  };

  const handleBarcodeKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBarcodeSubmit();
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    const orderPayload = {
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      discount,
      tax,
      total,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const resultAction = await dispatch(createOrder(orderPayload));

    if (createOrder.fulfilled.match(resultAction)) {
      dispatch(clearCart());
      navigate("/checkout");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;

      if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [items, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-900 p-4 shadow-lg">
        <h1 className="text-2xl font-bold">POS Terminal</h1>
        <span
          className={`rounded-full px-4 py-2 text-sm font-medium ${
            online ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {online ? "Online" : "Offline"}
        </span>
      </div>

      {!online && (
        <p className="mb-4 rounded-lg bg-red-900 px-4 py-2 text-sm text-red-200">
          You are offline. Some POS actions may not sync until connection
          returns.
        </p>
      )}

      {orderSuccess && (
        <p className="mb-4 rounded-lg bg-green-900 px-4 py-2 text-sm text-green-200">
          Order placed successfully.
        </p>
      )}

      {orderError && (
        <p className="mb-4 rounded-lg bg-red-900 px-4 py-2 text-sm text-red-200">
          {orderError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 p-4 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Products</h2>

          <div className="mb-4 space-y-3">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products... (Press /)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
            />

            <input
              ref={barcodeInputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={handleBarcodeKeyDown}
              placeholder="Scan barcode or type product and press Enter (Ctrl+B)"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none"
            />
          </div>

          {loading && <p className="text-slate-300">Loading products...</p>}
          {error && <p className="text-red-400">{error}</p>}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-slate-400">No matching products found.</p>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="rounded-xl bg-slate-800 p-4 shadow"
                >
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <p className="mt-2 text-slate-300">₹{product.price}</p>
                  <button
                    onClick={() => dispatch(addToCart(product))}
                    className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-slate-900 p-4 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Cart</h2>

          {items.length === 0 ? (
            <p className="text-slate-400">No items in cart</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-lg bg-slate-800 p-3">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-slate-300">₹{item.price}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => dispatch(decreaseQty(item.id))}
                      className="rounded bg-gray-700 px-3 py-1"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => dispatch(increaseQty(item.id))}
                      className="rounded bg-gray-700 px-3 py-1"
                    >
                      +
                    </button>
                    <button
                      onClick={() => dispatch(removeFromCart(item.id))}
                      className="ml-auto rounded bg-red-600 px-3 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="space-y-2 border-t border-slate-700 pt-4 text-sm">
                <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                <p>Discount: ₹{discount.toFixed(2)}</p>
                <p>Tax: ₹{tax.toFixed(2)}</p>
                <p className="text-lg font-bold">Total: ₹{total.toFixed(2)}</p>
              </div>

              <button
                onClick={handleCheckout}
                disabled={items.length === 0 || orderLoading || !online}
                className="w-full rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {orderLoading ? "Placing Order..." : "Checkout"}
              </button>

              <button
                onClick={() => dispatch(clearCart())}
                className="w-full rounded-lg bg-red-500 px-4 py-2 font-semibold hover:bg-red-600"
              >
                Clear Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default POSPage;