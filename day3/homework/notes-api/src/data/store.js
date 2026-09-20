let users = [];
let nextUserId = 1;

let notes = [];
let nextNoteId = 1;

// ==================== USERS ====================

const users_findByEmail = email => {
  return users.find(user => user.email === email);
};

const users_findById = id => {
  return users.find(user => user.id === Number(id));
};

const users_create = ({
  name,
  email,
  hashedPassword,
  role = "user",
}) => {
  const user = {
    id: nextUserId++,
    name,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date(),
  };

  users.push(user);

  return user;
};

const users_update = (id, data) => {
  const index = users.findIndex(
    user => user.id === Number(id)
  );

  if (index === -1) return null;

  users[index] = {
    ...users[index],
    ...data,
    id: users[index].id,
    updatedAt: new Date(),
  };

  return users[index];
};

const users_getAll = () => {
  return [...users];
};

const users_remove = id => {
  const index = users.findIndex(
    user => user.id === Number(id)
  );

  if (index === -1) return false;

  users.splice(index, 1);

  return true;
};

// ==================== NOTES ====================

const notes_getAll = (filter = {}) => {
  let result = [...notes];

  if (filter.userId !== undefined) {
    result = result.filter(
      note => note.userId === Number(filter.userId)
    );
  }

  if (filter.tag) {
    result = result.filter(note =>
      note.tags.includes(filter.tag)
    );
  }

  return result;
};

const notes_findById = id => {
  return notes.find(
    note => note.id === Number(id)
  );
};

const notes_create = ({
  userId,
  title,
  content,
  tags = [],
}) => {
  const now = new Date();

  const note = {
    id: nextNoteId++,
    userId: Number(userId),
    title,
    content,
    tags,
    createdAt: now,
    updatedAt: now,
  };

  notes.push(note);

  return note;
};

const notes_update = (id, data) => {
  const index = notes.findIndex(
    note => note.id === Number(id)
  );

  if (index === -1) return null;

  notes[index] = {
    ...notes[index],
    ...data,
    id: notes[index].id,
    userId: notes[index].userId,
    createdAt: notes[index].createdAt,
    updatedAt: new Date(),
  };

  return notes[index];
};

const notes_remove = id => {
  const index = notes.findIndex(
    note => note.id === Number(id)
  );

  if (index === -1) return false;

  notes.splice(index, 1);

  return true;
};

// ==================== SEED ADMIN ====================

const seedAdmin = async () => {
  const bcrypt = require("bcrypt");

  const existing =
    users_findByEmail("admin@example.com");

  if (existing) return existing;

  const hashedPassword =
    await bcrypt.hash("Admin@123", 10);

  const admin = users_create({
    name: "Admin",
    email: "admin@example.com",
    hashedPassword,
    role: "admin",
  });

  console.log(
    `Admin seeded: admin@example.com / Admin@123 (id: ${admin.id})`
  );

  return admin;
};

module.exports = {
  users: {
    findByEmail: users_findByEmail,
    findById: users_findById,
    create: users_create,
    update: users_update,
    getAll: users_getAll,
    remove: users_remove,
  },

  notes: {
    getAll: notes_getAll,
    findById: notes_findById,
    create: notes_create,
    update: notes_update,
    remove: notes_remove,
  },

  seedAdmin,
};