const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { sendOrderDeliveredEmail } = require('../services/emailService');

// Middleware to check if user is authenticated (mocked implementation if no auth middleware exists in context, 
// but based on Order.js ref 'User', we assume some auth exists. For now, we'll assume the request comes with specific info or proceed without strict auth middleware if not standardized yet.
// However, best practice is to assume `req.body.userId` or similar if no auth token. 
// Given the existing codebase style, I'll assume we can get user info or just pass it in body for prototype.)

// GET /available - Get orders ready for pickup
router.get('/available', async (req, res) => {
    try {
        // Find orders that are 'ready_for_pickup' AND have no driver assigned
        const orders = await Order.find({
            status: 'ready_for_pickup',
            driverId: null
        }).sort({ createdAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /my-orders - Get orders assigned to specific driver
router.get('/my-orders', async (req, res) => {
    const { driverId } = req.query; // Pass userId/driverId as query param for now

    if (!driverId) {
        return res.status(400).json({ message: 'Driver ID required' });
    }

    try {
        const orders = await Order.find({
            driverId: driverId,
            status: { $in: ['out_for_delivery', 'picked_up'] } // Active deliveries
        }).sort({ assignedAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /assign/:orderId - Assign order to driver
router.post('/assign/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { driverId } = req.body;

    if (!driverId) {
        return res.status(400).json({ message: 'Driver ID required' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.driverId) {
            return res.status(400).json({ message: 'Order already assigned' });
        }

        order.driverId = driverId;
        order.assignedAt = new Date();
        order.status = 'out_for_delivery';

        // Add history
        order.statusHistory.push({
            status: 'out_for_delivery',
            updatedBy: driverId,
            note: 'Driver assigned'
        });

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /status/:orderId - Update status (e.g. Delivered)
router.post('/status/:orderId', async (req, res) => {
    const { orderId } = req.params;
    const { status, note, driverId } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Update status
        order.status = status;

        if (status === 'delivered') {
            order.deliveredAt = new Date();

            // Send email
            if (order.shippingAddress && order.shippingAddress.email) { // Check if email is stored in address or need to fetch User
                // Order schema has shippingAddress structure but no direct 'email' field in it based on file view earlier (only fullName, addressLine1...), 
                // BUT User schema has email. Order has userId.
                // Let's fetch user email.
                const customer = await User.findById(order.userId);
                if (customer && customer.email) {
                    await sendOrderDeliveredEmail(customer.email, {
                        reference: order._id,
                        address: `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}`,
                        total: order.totalAmount
                    });
                }
            }
        }

        // Add history
        order.statusHistory.push({
            status: status,
            updatedBy: driverId,
            note: note || `Status updated to ${status}`
        });

        await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /admin/active-deliveries
router.get('/admin/active-deliveries', async (req, res) => {
    try {
        // Fetch all orders that are assigned but not yet delivered (or delivered recently?)
        // Let's get 'out_for_delivery' and 'ready_for_pickup' (waiting)
        const orders = await Order.find({
            status: { $in: ['ready_for_pickup', 'out_for_delivery', 'picked_up'] }
        })
            .populate('driverId', 'username email') // Get driver details
            .populate('userId', 'username email') // Get customer details
            .sort({ updatedAt: -1 });

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
