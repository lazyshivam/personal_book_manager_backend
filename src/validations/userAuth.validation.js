const Joi = require('joi');
const { objectId } = require('./custom.validation');



const updateUser = {
    params: Joi.object().keys({
        userId: Joi.required().custom(objectId),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().required(),
            email: Joi.string().required(),
            phone: Joi.string().allow('').allow(null),
            alternatePhone: Joi.string().allow('').allow(null),
            password: Joi.string(),
            id: Joi.string()
        })
        .min(1),
};

const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId),
    }),
};

const registerUser = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().required().email(),
        password: Joi.string().allow('').required(),
        confirmPassword: Joi.string().allow('').allow(null),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

const logout = {
    
};

const refreshTokens = {
   
};
const getUser = {
   
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
    }),
};

const resetPassword = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),
    body: Joi.object().keys({
        password: Joi.string().required(),
        // password: Joi.string().required().custom(password),
    }),
};
const verifyEmail = {
    query: Joi.object().keys({
        token: Joi.string().required(),
    }),

};

module.exports = {
    updateUser,
    deleteUser,
    registerUser,
    login,
    refreshTokens,
    forgotPassword,
    resetPassword,
    logout,
    getUser,
    verifyEmail
};