const express = require('express');
const axios = require('axios');

const router = express.Router();

const URL = 'http://localhost:9002/api/v2';

const request = async (req, api) => {
    try {
        if (!req.session.jwt) {
            const tokenResult = await axios.post(`${URL}/token`, {
                clientSecret: process.env.CLIENT_SECRET
            });
            req.session.jwt = tokenResult.data.token;
        } 
        const result = await axios.get(`${URL}${api}`, {
            headers: { authorization: req.session.jwt }
        });
        return result;
    } catch (err) {
        console.error(err);
        if (err.response.status < 500) {
            return err.response;
        }
        throw error;
    }
}


router.get('/', (req, res) => {
    res.end('api client.');
});

router.get('/test', async (req, res, next) => {
    try {
        if(!req.session.jwt) {
            const tokenResult = await axios.post('http://localhost:9002/api/v2/token', {
                clientSecret: process.env.CLIENT_SECRET
            });
            if (tokenResult.data && tokenResult.data.code === 200) {
                req.session.jwt = tokenResult.data.token;
            } else {
                return res.json(tokenResult.data);
            }
        }
        const result = await axios.get('http://localhost:9002/api/v2/test', {
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

router.get('/mypost', async (req, res, next) => {
    try {
        const result = await request(req, '/posts/my');
        res.json(result.data);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

router.get('/search/:hashtag', async (req, res, next) => {
    try {
        const result = await request(req, `/posts/hashtag/${encodeURIComponent(req.params.hashtag)}`);
        res.json(result.data);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;