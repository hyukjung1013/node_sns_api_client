const express = require('express');
const axios = require('axios');

const router = express.Router();

router.get('/', (req, res) => {
    res.end('api client.');
});

router.get('/test', async (req, res, next) => {
    try {
        if(!req.session.jwt) {
            const tokenResult = await axios.post('http://localhost:9002/api/v1/token', {
                clientSecret: process.env.CLIENT_SECRET
            });
            if (tokenResult.data && tokenResult.data.code === 200) {
                req.session.jwt = tokenResult.data.token;
            } else {
                return res.json(tokenResult.data);
            }
        }
        const result = await axios.get('http://localhost:9002/api/v1/test', {
            headers: { authorization: req.session.jwt }
        });
        return res.json(result.data);

    } catch (err) {
        console.error(err);
        if(err.response.status === 419) {
            return res.json(error.response.data);
        }
        return next(err);
    }
});

module.exports = router;