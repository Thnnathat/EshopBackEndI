const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { OrderItem } = require('../models/OrderItem');

router.get('/', async (req, res) => {
    const orders = await Order.find().populate('user', 'name').sort({ 'dateOrdered': -1 });

    if (!orders) {
        return res.status(400).send({ success: false });
    }

    res.status(200).send(orders);

});

router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });

    if (!order) {
        return res.status(400).send({ success: false });
    }

    res.status(200).send(order);

});

router.post('/', async (req, res) => {
    const orderItemIds = await Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }));

    const totalPrices = await Promise.all(orderItemIds.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice;
    }));

    console.log(totalPrices);
    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user
    });

    order = await order.save();

    if (!order) {
        res.status(404).send('the order cannot be created.');
    }

    res.send(order);
});

router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        {
            new: true // Return data last data. If false is a old data.
        }
    );

    if (!order)
        return res.status(400).send('The order cannot be updated');

    res.send(order);
});

router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem);
            });
            return res.status(200).json({ success: true, message: 'the order is deleted.' });
        } else {
            return res.status(404).json({ success: false, message: 'order not found.' });
        }
    }).catch(error => {
        return res.status(500).json({ success: false, error });
    });
});

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) {
        return res.status(400).send('The order sales cannot be generated.');
    }

    res.send({ totalSales: totalSales.pop().totalsales });
});

router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) {
        res.status(400).send({ success: false });
    }
    res.status(200).send({
        count: orderCount
    });
});

router.get('/get/userorders/:userid', async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });

    if (!userOrderList) {
        return res.status(400).send({ success: false });
    }

    res.status(200).send(userOrderList);

});

module.exports = router;