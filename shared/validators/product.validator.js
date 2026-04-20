const { body, validationResult } = require('express-validator');

const productValidator = [
    body('name')
        .notEmpty()
        .withMessage('Product name is required.')
        .isString()
        .withMessage('Product name must be a string.'),
    
    body('price')
        .notEmpty()
        .withMessage('Product price is required.')
        .isNumeric()
        .withMessage('Product price must be a number.'),
    
    body('description')
        .optional()
        .isString()
        .withMessage('Product description must be a string.'),
    
    body('category')
        .optional()
        .isString()
        .withMessage('Product category must be a string.'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = productValidator;