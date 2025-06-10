const ensureTreasure = (req, res, next) => {
  if (req.user && (req.user.role === 'treasure' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Treasure or admin access required.' });
  }
};

module.exports = ensureTreasure; 