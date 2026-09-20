/**
 * Bài 3: Callback, Promise, Async/Await
 * Day 1 - JavaScript Bất đồng bộ
 */

// ============================================================
// Helper functions
// ============================================================

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Fake database
const db = {
  users: [
    { id: 1, name: "Alice", teamId: 10 },
    { id: 2, name: "Bob", teamId: 20 },
  ],

  teams: [
    { id: 10, teamName: "Backend", managerId: 100 },
    { id: 20, teamName: "Frontend", managerId: 200 },
  ],

  managers: [
    { id: 100, name: "Charlie", email: "charlie@company.com" },
    { id: 200, name: "Diana", email: "diana@company.com" },
  ],
};
// ============================================================
// Bài 3.1: Callback -> Promise
// ============================================================

function readFileFake(filename, callback) {
  setTimeout(() => {
    if (filename.endsWith(".txt")) {
      callback(null, `Content of ${filename}`);
    } else {
      callback(new Error("Only .txt files allowed"));
    }
  }, 500);
}

function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFileFake(filename, (error, content) => {
      if (error) {
        reject(error);
      } else {
        resolve(content);
      }
    });
  });
}

// Test file đúng
readFilePromise("data.txt")
  .then(content => console.log(content))
  .catch(error => console.error(error.message));

// Test file sai
readFilePromise("data.json")
  .then(content => console.log(content))
  .catch(error => console.error(error.message));
  // getUser(id) -> resolve user, reject nếu không tìm thấy
function getUser(id) {
  return delay(500).then(() => {
    const user = db.users.find(user => user.id === id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  });
}

// getTeam(teamId) -> resolve team, reject nếu không tìm thấy
function getTeam(teamId) {
  return delay(500).then(() => {
    const team = db.teams.find(team => team.id === teamId);

    if (!team) {
      throw new Error("Team not found");
    }

    return team;
  });
}

// getManager(managerId) -> resolve manager, reject nếu không tìm thấy
function getManager(managerId) {
  return delay(500).then(() => {
    const manager = db.managers.find(
      manager => manager.id === managerId
    );

    if (!manager) {
      throw new Error("Manager not found");
    }

    return manager;
  });
}

// Promise chain
getUser(1)
  .then(user => {
    console.log("User:", user);
    return getTeam(user.teamId);
  })
  .then(team => {
    console.log("Team:", team);
    return getManager(team.managerId);
  })
  .then(manager => {
    console.log("Manager:", manager);
  })
  .catch(error => {
    console.error(error.message);
  });
  // ============================================================
// Bài 3.3: Async/Await với error handling
// ============================================================

async function getUserManager(userId) {
  if (userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const user = await getUser(userId);
  const team = await getTeam(user.teamId);
  const manager = await getManager(team.managerId);

  return manager;
}

// Test
getUserManager(1)
  .then(manager => {
    console.log("Manager of user 1:", manager.name);
  })
  .catch(error => {
    console.error(error.message);
  });

getUserManager(-1)
  .then(manager => {
    console.log(manager);
  })
  .catch(error => {
    console.error(error.message);
  });

getUserManager(99)
  .then(manager => {
    console.log(manager);
  })
  .catch(error => {
    console.error(error.message);
  });
  // ============================================================
// Bài 3.4: So sánh tuần tự vs song song
// ============================================================

// a) Chạy tuần tự
async function fetchSequential() {
  const start = Date.now();

  try {
    await getUser(1);
    await getUser(2);
    await getUser(3);
  } catch (error) {
    console.error("Sequential error:", error.message);
  } finally {
    const elapsed = Date.now() - start;
    console.log(`Sequential: ${elapsed}ms`);
  }
}

// b) Chạy song song
async function fetchParallel() {
  const start = Date.now();

  try {
    await Promise.all([
      getUser(1),
      getUser(2),
      getUser(3)
    ]);
  } catch (error) {
    console.error("Parallel error:", error.message);
  } finally {
    const elapsed = Date.now() - start;
    console.log(`Parallel: ${elapsed}ms`);
  }
}

// Chạy lần lượt để dễ so sánh
async function compare() {
  await fetchSequential();
  await fetchParallel();
}

compare();