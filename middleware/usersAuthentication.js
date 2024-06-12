const isLoggedIn = async (req, res, next) => {
    try {
        if (req.session.user) {
            console.log("checking blocked user or not",req.session.user.isBlocked);
            if(!req.session.user.isBlocked)
            {
                console.log("checking blocked user or not",req.session.user.isBlocked);
                next(); // User is logged in, proceed to the next middleware/route handler

            }else
            { 
                console.log("checking blocked user or not",req.session.user.isBlocked);
                req.session.destroy()
                res.redirect('/login')
            }
            
        } else {
            res.redirect('/login'); // Redirect to login page if user is not logged in
        }
    } catch (error) {
        console.log('Error from user-side authentication middleware:', error);
        res.status(500).send('An error occurred');
    }
};

const isLoggedOut = async (req, res, next) => {
    try {
        if (req.session.user) {

            res.redirect('/home'); // Redirect to dashboard if user is already logged in
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
    isLoggedOut
};
