import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useCart from '../hooks/useCart';

const Navbar = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md'>
      {/* Logo */}
      <Link to='/' className='text-xl font-bold'>
        🍔 FoodApp
      </Link>

      {/* Nav Links */}
      {isLoggedIn && (
        <div className='flex items-center gap-6'>
          <Link to='/restaurants' className='hover:underline'>
            Restaurants
          </Link>
          <Link to='/my-orders' className='hover:underline'>
            My Orders
          </Link>
          <Link to='/cart' className='hover:underline relative'>
            🛒 Cart
            {totalItems > 0 && (
              <span className='absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      )}

      {/* Auth */}
      <div className='flex items-center gap-4'>
        {isLoggedIn ? (
          <>
            <span className='text-sm'>Hi, {user?.name?.split(' ')[0]}</span>
            <button
              onClick={handleLogout}
              className='bg-white text-orange-500 px-3 py-1 rounded font-semibold hover:bg-orange-100'
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to='/login' className='hover:underline'>Login</Link>
            <Link
              to='/register'
              className='bg-white text-orange-500 px-3 py-1 rounded font-semibold'
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;