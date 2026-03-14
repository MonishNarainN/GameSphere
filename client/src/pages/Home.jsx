import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Rating } from '@mui/material';
import { motion } from 'framer-motion';

function Home() {
  const navigate = useNavigate();
  const [featuredGames, setFeaturedGames] = useState([]);

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // sort by rating and take top 3
          const topGames = data.sort((a, b) => b.rating - a.rating).slice(0, 3);
          setFeaturedGames(topGames);
        }
      })
      .catch((err) => console.error('Failed to fetch games for home:', err));
  }, []);
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(45deg, #121212 30%, #1E1E1E 90%)' }}>
      <Container maxWidth="xl">
        <Grid container spacing={4} sx={{ py: 8 }}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  mb: 2,
                  background: 'linear-gradient(45deg, #4A90E2, #FF4081)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome to GameSphere
              </Typography>
              <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                Your ultimate destination for game reviews, discussions, and community
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mr: 2, fontFamily: 'Rajdhani' }}
                  onClick={() => navigate('/games')}
                >
                  Explore Games
                </Button>
              </motion.div>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 400 }}>
              <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <mesh>
                  <boxGeometry args={[2, 2, 2]} />
                  <meshStandardMaterial color="hotpink" />
                </mesh>
                <OrbitControls enableZoom={false} autoRotate />
              </Canvas>
            </Box>
          </Grid>
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" sx={{ mb: 4, fontFamily: 'Rajdhani', textAlign: 'center' }}>
            Featured Games
          </Typography>

          <Grid container spacing={4} sx={{ mb: 8 }}>
            {featuredGames.map((game, index) => (
              <Grid item xs={12} md={4} key={game.title}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={game.image}
                      alt={game.title}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div" sx={{ fontFamily: 'Rajdhani' }}>
                        {game.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Genre: {game.genre}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={game.rating} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                        <Typography variant="body2">{game.rating}/5</Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}

export default Home;