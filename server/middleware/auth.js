const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    console.log('Auth failed:', {
      session: req.session,
      cookies: req.cookies,
      headers: req.headers
    });
    res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please log in to access this resource'
    });
  }
};

module.exports = {
  isAuthenticated
}; 