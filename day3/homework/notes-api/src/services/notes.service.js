const store =
  require("../data/store");

function createError(
  message,
  statusCode
) {
  const err =
    new Error(message);

  err.statusCode =
    statusCode;

  return err;
}

async function getUserNotes(
  userId,
  filter = {}
) {
  let notes =
    store.notes.getAll({
      userId,
      tag: filter.tag,
    });

  if (filter.q) {
    const keyword =
      filter.q.toLowerCase();

    notes = notes.filter(
      note =>
        note.title
          .toLowerCase()
          .includes(keyword) ||
        note.content
          .toLowerCase()
          .includes(keyword)
    );
  }

  return notes;
}

async function getAllNotes(
  filter = {}
) {
  let notes =
    store.notes.getAll({
      tag: filter.tag,
    });

  if (filter.q) {
    const keyword =
      filter.q.toLowerCase();

    notes = notes.filter(
      note =>
        note.title
          .toLowerCase()
          .includes(keyword) ||
        note.content
          .toLowerCase()
          .includes(keyword)
    );
  }

  return notes;
}

async function getNoteById(
  id,
  requestingUserId = null
) {
  const note =
    store.notes.findById(id);

  if (!note) {
    throw createError(
      "Note not found",
      404
    );
  }

  if (
    requestingUserId !== null &&
    note.userId !==
      Number(requestingUserId)
  ) {
    throw createError(
      "Not authorized to access this note",
      403
    );
  }

  return note;
}

async function createNote({
  userId,
  title,
  content,
  tags,
}) {
  return store.notes.create({
    userId,
    title,
    content,
    tags,
  });
}

async function updateNote(
  id,
  data,
  requestingUserId
) {
  const note =
    store.notes.findById(id);

  if (!note) {
    throw createError(
      "Note not found",
      404
    );
  }

  if (
    note.userId !==
    Number(requestingUserId)
  ) {
    throw createError(
      "Not authorized to access this note",
      403
    );
  }

  return store.notes.update(
    id,
    data
  );
}

async function deleteNote(
  id,
  requestingUserId
) {
  const note =
    store.notes.findById(id);

  if (!note) {
    throw createError(
      "Note not found",
      404
    );
  }

  if (
    note.userId !==
    Number(requestingUserId)
  ) {
    throw createError(
      "Not authorized to access this note",
      403
    );
  }

  store.notes.remove(id);

  return true;
}

module.exports = {
  getUserNotes,
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};