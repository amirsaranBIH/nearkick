const router = require("express").Router();
const authModel = require("../models/auth");
const { isAuthenticated } = require("../middleware/auth.middleware");

router.post("/login", (req, res) => {
  authModel
    .login(req.body.email, req.body.password)
    .then((result) => {
      if (!result) {
        res.json({ status: "wrong-password" });
        return;
      }
      req.session.userId = result;
      req.session.email = req.body.email;
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

router.post("/register", (req, res) => {
  authModel
    .register(req.body.email, req.body.password)
    .then((result) => {
      req.session.userId = result;
      req.session.email = req.body.email;
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

router.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  res.cookie("connect.sid", "", { expires: new Date(0) });
  res.json({ status: "success", data: true });
});

router.get("/user", isAuthenticated, (req, res) => {
  authModel
    .getUser(req.session.userId)
    .then((result) => {
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

module.exports = router;
