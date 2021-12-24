module.exports = {
  isAuthenticated: (req, res, next) => {
    if (!req.session.userId) {
      res.json({ status: "failed", message: "Not logged in" });
      return;
    }
    next();
  },
  isAuthorized: (req, res, next) => {
    if (req.session.userId !== parseInt(req.params.userId, 10)) {
      res.json({ status: "failed", message: "Not authorized" });
      return;
    }
    next();
  },
};
