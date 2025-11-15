import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  selectCartItems,
  selectCartTotal,
} from '../features/cart/cartSelectors';
import { placeOrderr, setOrderStatus, setOrderError } from '../features/order/orderSlice';
import { clearCart } from '../features/cart/cartSlice';
import { formatPrice } from '../utils/helpers';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from Redux
  const cartItems = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const orderStatus = useSelector((state) => state.order.status);
  const orderError = useSelector((state) => state.order.error);

  // Local state for the customer form
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    address: '',
  });
  
  // Local state for form validation errors
  const [errors, setErrors] = useState({});

  // Redirect to cart if it's empty
  if (cartItems.length === 0 && orderStatus !== 'loading') {
    navigate('/cart');
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
    // Clear validation error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!customer.name) newErrors.name = 'Name is required';
    if (!customer.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(customer.email)) newErrors.email = 'Email is invalid';
    if (!customer.address) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * This is the CORE INTEGRATION POINT.
   * This function sends the order to the backend API.
   */
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // 1. Construct the orderData object
    const orderData = {
      items: cartItems,
      customer: customer,
      total: total,
    };

    dispatch(setOrderStatus('loading'));

    try {
      // 2. Make the async fetch request to the backend
      const apiUrl = `${process.env.REACT_APP_API_URL}//api/orders`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      // 7. Await the response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }
      
      const savedOrder = await response.json();

      // 8. On Success:
      // Dispatch the order to the Redux order slice
      dispatch(placeOrder(savedOrder));
      
      // Dispatch clearCart to empty the cart
      dispatch(clearCart());
      
      // Navigate to the confirmation page
      navigate('/order-confirmation');

    } catch (err) {
      // 9. On Failure:
      console.error('Failed to place order:', err);
      dispatch(setOrderError(err.message));
    }
  };

  return (
    <Box>
      <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
        Checkout
      </Typography>
      <form onSubmit={handlePlaceOrder}>
        <Grid container spacing={4}>
          {/* Shipping Form */}
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Shipping Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    name="name"
                    label="Full Name"
                    value={customer.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={customer.email}
                    onChange={handleInputChange}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="address"
                    name="address"
                    label="Shipping Address"
                    multiline
                    rows={3}
                    value={customer.address}
                    onChange={handleInputChange}
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Your Order
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
                >
                  <Typography>
                    {item.name} (x{item.quantity})
                  </Typography>
                  <Typography>{formatPrice(item.price * item.quantity)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Total</Typography>
                <Typography variant="h6" fontWeight="bold">{formatPrice(total)}</Typography>
              </Box>
              
              {orderError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {orderError}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{ mt: 3 }}
                disabled={orderStatus === 'loading'}
              >
                {orderStatus === 'loading' ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Place Order'
                )}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default CheckoutPage;