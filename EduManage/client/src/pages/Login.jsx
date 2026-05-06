import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { School, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Wait for auth context to update user, or just fetch the me endpoint data from login response.
      // But login in context sets user. We can't immediately read it.
      // Let's rely on App.jsx for default redirect, OR fix Login.jsx logic.
      // Easiest is let login throw error if failed, otherwise:
      navigate('/');
    } catch (err) {
      setError('Invalid credentials or access pending.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-bgPrimary">
      {/* Background SVGs (simplified placeholder for doodles) */}
      <div className="absolute top-10 left-10 opacity-10 text-6xl">✏️</div>
      <div className="absolute bottom-20 right-20 opacity-10 text-6xl">📏</div>
      <div className="absolute top-1/4 right-1/4 opacity-10 text-6xl">🍎</div>
      <div className="absolute bottom-1/3 left-1/4 opacity-10 text-6xl">🌟</div>

      <div className="w-full max-w-[480px] bg-cardBg rounded-card shadow-card relative z-10 pt-16 pb-8 px-10 border border-borderColor mt-8">
        {/* Rainbow top band */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accentRed via-accentYellow to-accentPurple rounded-t-card"></div>
        
        {/* Logo Circle */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-sidebarBg rounded-full flex items-center justify-center shadow-md">
          <School size={40} className="text-white" />
        </div>

        <div className="text-center mb-6">
          <h1 className="font-heading text-[32px] text-sidebarBg m-0">EduManage</h1>
          <p className="text-textSecondary font-body mt-1">School Management System</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-1 bg-accentYellow opacity-50 rounded-full wavy-underline"></div>
        </div>

        {error && <div className="bg-red-100 text-accentRed p-3 rounded-md mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-textPrimary mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-3 focus:outline-none focus:border-accentYellow transition-colors"
              placeholder="admin@school.com"
              required
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-bold text-textPrimary mb-1">Password</label>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-bgPrimary border-2 border-borderColor rounded-input px-4 py-3 focus:outline-none focus:border-accentYellow transition-colors"
              placeholder="••••••••"
              required
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-9 text-textSecondary hover:text-textPrimary"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-sidebarBg text-white font-heading text-lg py-3 rounded-btn mt-6 btn-crayon shadow-crayon"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm text-textSecondary mt-6">
          🎓 Access managed by your institution operator
        </p>

        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 rounded-full bg-accentRed"></div>
          <div className="w-3 h-3 rounded-full bg-accentOrange"></div>
          <div className="w-3 h-3 rounded-full bg-accentYellow"></div>
          <div className="w-3 h-3 rounded-full bg-accentGreen"></div>
          <div className="w-3 h-3 rounded-full bg-accentBlue"></div>
          <div className="w-3 h-3 rounded-full bg-accentPurple"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
