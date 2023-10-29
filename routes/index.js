const router = require('express').Router();

router.get('/',(req, res) => {
    res.render('home')
})

router.get('/interface',(req,res) => {
    res.render('interface');
})

module.exports = router;