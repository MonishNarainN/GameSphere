import { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Tooltip,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff, InfoOutlined, Google, Facebook, Twitter } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Link, useNavigate } from 'react-router-dom';

function PasswordStrength({ value }) {
  let score = 0;
  if (value.length > 7) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const levels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ff1744', '#ff9100', '#4caf50', '#00e676'];
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Typography variant="caption" color={colors[score]}>
        Password Strength: {levels[score]}
      </Typography>
      <Box sx={{ height: 6, width: '100%', background: '#222', borderRadius: 2, mt: 0.5 }}>
        <Box sx={{ height: 6, width: `${(score + 1) * 25}%`, background: colors[score], borderRadius: 2, transition: 'width 0.3s' }} />
      </Box>
    </Box>
  );
}

function HotPinkCube() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }} style={{ width: '100%', height: '350px' }}>
      <ambientLight intensity={0.7} />
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <OrbitControls enableZoom={false} autoRotate />
    </Canvas>
  );
}

export default function SignUp() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
    terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Validation
  const emailValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
  const passwordMatch = form.password === form.confirm && form.confirm.length > 0;
  const passwordStrong = form.password.length > 7 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) && /[^A-Za-z0-9]/.test(form.password);
  const canSubmit = emailValid && passwordMatch && passwordStrong && form.terms && !loading;

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Account created! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #fff, #f8f8ff 60%, #ffe6fa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
      <Grid container spacing={4} sx={{ maxWidth: 1000, boxShadow: 6, borderRadius: 4, background: 'rgba(255,255,255,0.95)' }}>
        {/* Left: Form */}
        <Grid item xs={12} md={7} sx={{ p: { xs: 3, md: 6 } }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <Typography variant="h3" sx={{ fontFamily: 'Rajdhani', fontWeight: 700, background: 'linear-gradient(90deg, #4A90E2, #FF4081)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 1 }}>
              Create Account
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Join GameSphere and start your gaming adventure!
            </Typography>
            <form onSubmit={handleSubmit} autoComplete="off">
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                type="email"
                autoComplete="email"
                error={form.email.length > 0 && !emailValid}
                helperText={form.email.length > 0 && !emailValid ? 'Enter a valid email.' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Enter a valid email address.">
                        <InfoOutlined fontSize="small" color="action" />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <PasswordStrength value={form.password} />
              <TextField
                label="Confirm Password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                fullWidth
                margin="normal"
                required
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                error={form.confirm.length > 0 && !passwordMatch}
                helperText={form.confirm.length > 0 && !passwordMatch ? 'Passwords do not match.' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box sx={{ mb: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Password must be at least 8 characters, include an uppercase letter, a number, and a special character.
                </Typography>
              </Box>
              <FormControlLabel
                control={<Checkbox name="terms" checked={form.terms} onChange={handleChange} required />}
                label={<span>I agree to the <MuiLink href="#" target="_blank" rel="noopener" color="primary">Terms & Conditions</MuiLink></span>}
              />
              {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2, background: 'linear-gradient(90deg, #4A90E2, #FF4081)', color: '#fff', fontWeight: 700, fontFamily: 'Rajdhani', boxShadow: 3 }}
                disabled={!canSubmit}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                Sign Up
              </Button>
              <Divider sx={{ my: 2 }}>or sign up with</Divider>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                <IconButton color="primary"><Google /></IconButton>
                <IconButton color="primary"><Facebook /></IconButton>
                <IconButton color="primary"><Twitter /></IconButton>
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                Already have an account?{' '}
                <MuiLink component={Link} to="/login" color="secondary" sx={{ fontWeight: 600 }}>
                  Login
                </MuiLink>
              </Typography>
            </form>
          </motion.div>
        </Grid>
        {/* Right: 3D Animation */}
        <Grid item xs={12} md={5} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #4A90E2 0%, #FF4081 100%)', borderRadius: { md: '0 16px 16px 0', xs: '0 0 16px 16px' }, minHeight: 350 }}>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }} style={{ width: '100%' }}>
            <HotPinkCube />
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
} 