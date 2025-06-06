/* eslint-disable no-console*/
function isAuthenticated(role) {
  return (req, res, next) => {
    console.log(req.session.user);
    if (!req.session.user || req.session.user.role !== role) {
      return res.redirect('/');
    }
    next();
  };
}

module.exports = { isAuthenticated };
