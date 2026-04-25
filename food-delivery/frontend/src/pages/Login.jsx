import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ use context login

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // ✅ use context login function
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      navigate('/'); // ✅ navigate after context updates
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
          Login
        </h2>
        <div className='flex flex-col gap-3'>
          <input
            type='email'
            name='email'
            placeholder='Enter Email'
            value={formData.email}
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />
          <input
            type='password'
            name='password'
            placeholder='Enter Password'
            value={formData.password}
            onChange={handleChange}
            className='border p-3 rounded'
            required
          />
          <button
            type='submit'
            disabled={loading}
            className='bg-orange-500 text-white p-3 rounded font-semibold hover:bg-orange-600 disabled:opacity-50'
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {message && (
          <p className='mt-4 text-center text-sm text-red-500'>{message}</p>
        )}

        <p className='mt-4 text-center text-sm'>
          Don't have an account?{' '}
          <Link to='/register' className='text-orange-500 font-semibold'>
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;