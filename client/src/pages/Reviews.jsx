import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Button,
  TextField,
  Avatar,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import { SportsEsports, ThumbUp, Comment, Share } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const socket = io(); // Uses Vite proxy

function Reviews() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reviews, setReviews] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newReview, setNewReview] = useState({ game: '', review: '', rating: 5 });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setNewReview({ game: '', review: '', rating: 5 });
  };

  const handleSubmitReview = async () => {
    if (!newReview.game || !newReview.review) return;
    
    const username = user?.username || `Guest-${Math.floor(Math.random() * 1000)}`;
    const reviewPayload = {
      ...newReview,
      user: username,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      image: 'https://images.unsplash.com/photo-1629856515438-2325dd8b6d39?q=80&w=800&auto=format&fit=crop',
    };

    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewPayload),
      });
      handleCloseModal();
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        // Reverse so newest are at the top, or just set
        setReviews(data.reverse());
      })
      .catch(() => setReviews([]));

    socket.on('new review', (review) => {
      setReviews(prev => [review, ...prev]);
    });

    return () => {
      socket.off('new review');
    };
  }, []);

  const filteredReviews = reviews.filter(review =>
    review.game.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (review.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ minHeight: '90vh', py: 4, background: 'linear-gradient(45deg, #121212 30%, #1E1E1E 90%)' }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
              Game Reviews
            </Typography>
            <TextField
              fullWidth
              placeholder="Search games or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: 500, mb: 4 }}
            />
          </Box>
        </motion.div>

        <Grid container spacing={4}>
          {filteredReviews.map((review, index) => (
            <Grid item xs={12} key={review._id || review.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    background: 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Grid container>
                    <Grid item xs={12} md={6}>
                      <CardMedia
                        component="img"
                        height="300"
                        image={review.image}
                        alt={review.game}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h4" sx={{ fontFamily: 'Rajdhani', mb: 1 }}>
                            {review.game}
                          </Typography>
                          <Rating value={review.rating} precision={0.1} readOnly />
                        </Box>

                        <Typography variant="body1" sx={{ mb: 3, flexGrow: 1 }}>
                          {review.review}
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          {(review.tags || []).map((tag) => (
                            <Chip
                              key={tag}
                              label={tag}
                              sx={{ mr: 1, mb: 1 }}
                              color="primary"
                              size="small"
                            />
                          ))}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={`https://api.dicebear.com/7.x/bottts/svg?seed=${review.user?.name || review.user || 'Anonymous'}`} sx={{ mr: 2 }} />
                            <Typography variant="subtitle1">
                              {review.user?.name || review.user || 'Anonymous'}
                            </Typography>
                          </Box>

                          <Box>
                            <Button startIcon={<ThumbUp />} sx={{ mr: 1 }}>
                              {review.likes || 0}
                            </Button>
                            <Button startIcon={<Comment />} sx={{ mr: 1 }}>
                              {review.comments || 0}
                            </Button>
                            <Button startIcon={<Share />}>
                              Share
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<SportsEsports />}
              sx={{ fontFamily: 'Rajdhani' }}
              onClick={handleOpenModal}
            >
              Write a Review
            </Button>
          </Box>
        </motion.div>

        <Dialog open={openModal} onClose={handleCloseModal} PaperProps={{ sx: { background: '#1E1E1E', color: 'white' } }}>
          <DialogTitle sx={{ fontFamily: 'Rajdhani' }}>Write a Review</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Game Title"
              fullWidth
              variant="outlined"
              value={newReview.game}
              onChange={(e) => setNewReview({ ...newReview, game: e.target.value })}
              sx={{ input: { color: 'white' }, label: { color: 'gray' }, mb: 2, mt: 1 }}
            />
            <Typography variant="body2" sx={{ mb: 1, color: 'gray' }}>Rating:</Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview({ ...newReview, rating: newValue });
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Review"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={newReview.review}
              onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
              sx={{ textarea: { color: 'white' }, label: { color: 'gray' } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} sx={{ color: 'gray' }}>Cancel</Button>
            <Button onClick={handleSubmitReview} variant="contained" color="primary">Submit Review</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Reviews;