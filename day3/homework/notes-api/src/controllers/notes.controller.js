const notesService =
  require("../services/notes.service");

async function getMyNotes(
  req,
  res,
  next
) {
  try {
    const notes =
      await notesService.getUserNotes(
        req.user.userId,
        req.query
      );

    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length,
    });
  } catch (err) {
    next(err);
  }
}

async function getNoteById(
  req,
  res,
  next
) {
  try {
    const note =
      await notesService.getNoteById(
        req.params.id,
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

async function createNote(
  req,
  res,
  next
) {
  try {
    const note =
      await notesService.createNote({
        userId:
          req.user.userId,
        ...req.body,
      });

    res.status(201).json({
      success: true,
      data: note,
      message:
        "Note created successfully",
    });
  } catch (err) {
    next(err);
  }
}

async function updateNote(
  req,
  res,
  next
) {
  try {
    const note =
      await notesService.updateNote(
        req.params.id,
        req.body,
        req.user.userId
      );

    res.status(200).json({
      success: true,
      data: note,
      message: "Note updated",
    });
  } catch (err) {
    next(err);
  }
}

async function deleteNote(
  req,
  res,
  next
) {
  try {
    await notesService.deleteNote(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Note deleted",
    });
  } catch (err) {
    next(err);
  }
}

async function getAllNotes(
  req,
  res,
  next
) {
  try {
    const notes =
      await notesService.getAllNotes(
        req.query
      );

    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
};