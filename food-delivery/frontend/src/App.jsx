import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MyOrders from './pages/MyOrders';
import OrderTracking from './pages/OrderTracking';
import ReviewPage from './pages/ReviewPage';

// Components
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to='/login' />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />

        {/* Protected Routes */}
        <Route path='/' element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path='/restaurants' element={
          <ProtectedRoute><RestaurantList /></ProtectedRoute>
        } />
        <Route path='/restaurants/:id' element={
          <ProtectedRoute><RestaurantDetail /></ProtectedRoute>
        } />
        <Route path='/cart' element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        } />
        <Route path='/checkout' element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        } />
        <Route path='/my-orders' element={
          <ProtectedRoute><MyOrders /></ProtectedRoute>
        } />
        <Route path='/track/:orderId' element={
          <ProtectedRoute><OrderTracking /></ProtectedRoute>
        } />
        <Route path='/review/:orderId' element={
          <ProtectedRoute><ReviewPage /></ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;