const isLoggedIn = async (req, res, next) => {
  try {
    const platform = req.header('platform');
    if (req.session.user) {
      console.log('username  : ', req.session.user.username);
      console.log('checking blocked user or not', req.session.user.isBlocked);
      if (!req.session.user.isBlocked) {
        console.log('checking blocked user or not', req.session.user.isBlocked);
        next(); // User is logged in, proceed to the next middleware/route handler
      } else {
        console.log('checking blocked user or not', req.session.user.isBlocked);
        req.session.destroy();
        if (platform === 'expo') {
          return res.status(403).json({ message: 'User is blocked' });
        }
        res.redirect('/login');
      }
    } else {
      if (platform === 'expo') {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      res.redirect('/login'); // Redirect to login page if user is not logged in
    }
  } catch (error) {
    console.log('Error from user-side authentication middleware:', error);
    if (req.header('platform') === 'expo') {
      return res.status(500).json({ message: 'An error occurred' });
    }
    res.status(500).send('An error occurred');
  }
};

const isLoggedOut = async (req, res, next) => {
  try {
    if (req.session.user) {
      const platform = req.header('platform');
      if (platform == 'expo') {
        next();
      } else {
        res.redirect('/home'); // Redirect to dashboard if user is already logged in
      }
    } else {
      next(); // User is logged out, proceed to the next middleware/route handler
    }
  } catch (error) {
    console.log('Error from user-side authentication middleware:', error);
    res.status(500).send('An error occurred');
  }
};

module.exports = {
  isLoggedIn,
  isLoggedOut,
};
