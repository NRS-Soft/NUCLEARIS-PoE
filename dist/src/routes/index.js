import express from 'express';
const router = express.Router({ mergeParams: true });
router.get('/', (req, res) => {
    res.json({ message: 'Bienvenido a la NRS Blockchain API' });
});
module.exports = router;
//# sourceMappingURL=index.js.map