const { verifyGitHubJWT } = require('../utills/utils');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Check if header starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token format. Use Bearer token.' 
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    // Verify token using the utility function
    const decoded = verifyGitHubJWT(token);
    
    // Add decoded token data to request object
    req.user = decoded;
    req.token = token;
    
    // Continue to next middleware/route handler
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Access denied. Invalid token.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Access denied. Token expired.' 
      });
    }
    
    // Generic error
    return res.status(401).json({ 
      error: 'Access denied. Token verification failed.' 
    });
  }
};

module.exports = authMiddleware;