import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';

function Games() {
  const [games, setGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setGames(data);
        }
      })
      .catch((err) => console.error('Failed to fetch games:', err));
  }, []);

  const filteredGames = games.filter(
    (game) =>
      game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      game.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: '90vh', py: 4, background: 'linear-gradient(45deg, #121212 30%, #1E1E1E 90%)' }}>
      <Container maxWidth="xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="h2"
              sx={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                mb: 2,
                background: 'linear-gradient(45deg, #4A90E2, #FF4081)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Explore All Games
            </Typography>
            <TextField
              fullWidth
              placeholder="Search games by title or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 500, mb: 4 }}
            />
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {filteredGames.map((game, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                style={{ height: '100%' }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardMedia component="img" height="200" image={game.image} alt={game.title} />
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography gutterBottom variant="h5" component="div" sx={{ fontFamily: 'Rajdhani' }}>
                      {game.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Genre: {game.genre}
                    </Typography>
                    <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center' }}>
                      <Rating value={game.rating} precision={0.1} readOnly size="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{game.rating}/5</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Games;
