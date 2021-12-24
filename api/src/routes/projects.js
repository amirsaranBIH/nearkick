const router = require("express").Router();
const projectsModel = require("../models/projects");
const {
  isAuthenticated,
  isAuthorized,
} = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");

router.post("/create", isAuthenticated, upload.single("image"), (req, res) => {
  projectsModel
    .create(
      req.body.name,
      req.body.description,
      req.file.path,
      req.session.userId
    )
    .then((result) => {
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

router.get("/getAll", (req, res) => {
  projectsModel
    .getAll()
    .then((result) => {
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

router.get(
  "/getByUserId/:userId",
  isAuthenticated,
  isAuthorized,
  (req, res) => {
    projectsModel
      .getByUserId(req.params.userId)
      .then((result) => {
        res.json({ status: "success", data: result });
      })
      .catch((err) => {
        res.status(500).json({ status: "failed", message: err });
      });
  }
);

router.get("/:id", isAuthenticated, (req, res) => {
  projectsModel
    .getById(req.params.id)
    .then((result) => {
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

router.put("/:id", isAuthenticated, upload.single("image"), (req, res) => {
  projectsModel
    .updateById(
      req.params.id,
      req.body.name,
      req.body.description,
      req.file.path
    )
    .then((result) => {
      res.json({ status: "success", data: result });
    })
    .catch((err) => {
      res.status(500).json({ status: "failed", message: err });
    });
});

module.exports = router;
