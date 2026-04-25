import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth(); // ✅ use context register

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // ✅ use context register function
    const result = await register(formData);

    if (result.success) {
      navigate('/');
    } else {
      setMessage(result.message);
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded shadow-md w-full max-w-md'
      >
        <h2 className='text-2xl font-bold text-orange-500 mb-6 text-center'>
          Create Account
        </h2>
        <div className='flex flex-col gap-3'>
          <input
            type='text'
            name='name'
            placeholder='Full Name'
            value={formData.name}
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Email'
            value={formData.email}
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Password'
            value={formData.password}
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />
          <input
            type='text'
            name='phone'
            placeholder='Phone Number'
            value={formData.phone}
            onChange={handleChange}
            className='border p-3 rounded'
          />
          <input
            type='text'
            name='address'
            placeholder='Address'
            value={formData.address}
            onChange={handleChange}
            className='border p-3 rounded'
          />
          <select
            name='role'
            value={formData.role}
            onChange={handleChange}
            className='border p-3 rounded'
          >
            <option value='customer'>Customer</option>
            <option value='restaurant_owner'>Restaurant Owner</option>
            <option value='courier'>Courier</option>
          </select>
          <button
            type='submit'
            disabled={loading}
            className='bg-orange-500 text-white p-3 rounded font-semibold hover:bg-orange-600 disabled:opacity-50'
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>

        {message && (
          <p className='mt-4 text-center text-sm text-red-500'>{message}</p>
        )}

        <p className='mt-4 text-center text-sm'>
          Already have an account?{' '}
          <Link to='/login' className='text-orange-500 font-semibold'>
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;