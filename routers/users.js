const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models/User');

router.get('/', async (req, res) => {
    const users = await User.find().select('-passwordHash');

    if (!users) {
        return res.status(400).send({ success: false });
    }

    res.status(200).send(users);
});

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        return res.status(500).json({ message: 'The user with the given ID was not found.'});
    }
    res.status(200).send(user);
})

router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if (!user) {
        res.status(404).send('the user cannot be created.');
    }

    res.send(user);
});

router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    
    if(!user) {
        return res.status(400).send('The user not found.');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            process.env.SECRET_KEY,
            {
                expiresIn: '1d'
            }
        )

        return res.status(200).send({ user: user.email, token: token });

    } else {
        return res.status(400).send('password is wrong.');
    }

    return res.status(200).send(user);
});

module.exports = router;