const express = require('express')
const router = express.Router()
const { Category } = require('../models/Category');

router.get('/', async (req, res) => {
    const categories = await Category.find()
    if (!categories) {
        res.status(400).send({ success: false });
    }

    res.status(200).send(categories);
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return res.status(500).json({ message: "The category with the given ID was not found." });
    }
    res.status(200).send(category);
});

router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    if (!category) {
        res.status(404).send('the category cannot be created.');
    }

    res.send(category);
});

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {
            new: true // Return data last data. If false is a old data.
        }
    );

    if (!category)
        return res.status(400).send('The category cannot be updated');

    res.send(category);
});

// api/v1/:id
router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted.' });
        } else {
            return res.status(404).json({ success: false, message: 'category not found.' });
        }
    }).catch(error => {
        return res.status(400).json({ success: false, error });
    });
});

module.exports = router;