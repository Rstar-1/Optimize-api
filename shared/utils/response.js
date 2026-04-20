module.exports = {
    successResponse: (res, data, message = 'Success') => {
        return res.status(200).json({
            status: 'success',
            message,
            data,
        });
    },

    errorResponse: (res, error, message = 'An error occurred') => {
        return res.status(500).json({
            status: 'error',
            message,
            error,
        });
    },

    notFoundResponse: (res, message = 'Resource not found') => {
        return res.status(404).json({
            status: 'error',
            message,
        });
    },

    validationErrorResponse: (res, errors) => {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors,
        });
    },
};