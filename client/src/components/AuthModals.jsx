import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import toast from 'react-hot-toast';

const AuthModals = ({ type, onClose }) => {
  const [isLogin, setIsLogin] = useState(type === 'login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { email: formData.email, password: formData.password } : { name: formData.name, email: formData.email, password: formData.password };
      
      const { data } = await api.post(endpoint, payload);
      login(data, data.token);
      toast.success(`Welcome ${data.name}!`);
      onClose();
      
      if (!isLogin || !data.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate('/find-flat');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      if (msg === 'Email not registered') {
        toast.error('Email not registered. Please sign up first.');
        setIsLogin(false);
      } else if (msg === 'User already exists') {
        toast.error('Email already registered. Please login.');
        setIsLogin(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="text-gray-500 text-sm mb-6">{isLogin ? 'Login to continue to FlatSync' : 'Join FlatSync to find your perfect flatmate'}</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" placeholder="John Doe" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition" placeholder="••••••••" />
              </div>
            )}

            <button disabled={loading} type="submit" className="mt-2 w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-semibold shadow-md shadow-primary-500/30 transition disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={handleToggle} className="text-primary-600 font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer">
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModals;
