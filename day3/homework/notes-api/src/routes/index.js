const router =
  require("express").Router();

const {
  validate,
  authenticate,
  authorize,
} =
  require("../middleware");

const {
  registerSchema,
  loginSchema,
  createNoteSchema,
  updateNoteSchema,
  noteQuerySchema,
} =
  require("../schemas");

const authController =
  require("../controllers/auth.controller");

const notesController =
  require("../controllers/notes.controller");

// Health
router.get(
  "/health",
  (req, res) => {
    res.json({
      status: "ok",
      service: "notes-api",
      uptime:
        process.uptime(),
    });
  }
);

// Auth
router.post(
  "/auth/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/auth/login",
  validate(loginSchema),
  authController.login
);

// Notes
router.get(
  "/notes",
  authenticate,
  validate(
    noteQuerySchema,
    "query"
  ),
  notesController.getMyNotes
);

router.post(
  "/notes",
  authenticate,
  validate(
    createNoteSchema
  ),
  notesController.createNote
);

router.get(
  "/notes/:id",
  authenticate,
  notesController.getNoteById
);

router.put(
  "/notes/:id",
  authenticate,
  validate(
    updateNoteSchema
  ),
  notesController.updateNote
);

router.delete(
  "/notes/:id",
  authenticate,
  notesController.deleteNote
);

// Admin
router.get(
  "/admin/notes",
  authenticate,
  authorize("admin"),
  notesController.getAllNotes
);

module.exports = router;