
function isAuthenticated(req, res, next) {
        if (req.session && req.session.authenticated) {
            return next();
        } else {
            res.redirect('/admin?error=' + encodeURIComponent("You must be logged in to access the home page"));
        }
    }
    module.exports=isAuthenticated