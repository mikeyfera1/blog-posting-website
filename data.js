const mysql = require("mysql2/promise");

const connPool = mysql.createPool({
  connectionLimit: 5,
  host: "Host Port",
  user: "mySQL Username", 
  database: "mySQL database name",
  password: "password for the database",
});

async function createUser(username, password) {
  const [result] = await connPool.query(
    `INSERT INTO users (username, password)
     VALUES (?, ?)`,
    [username, password]
  );

  return result.insertId;
}

async function getUserByUsername(username) {
  const [rows] = await connPool.query(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  return rows[0] ?? null;
}

async function getUserById(id) {
  const [rows] = await connPool.query(
    `SELECT * FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function activateAdmin(id) {
    const [result] = await connPool.query(
        `UPDATE users SET is_admin = true WHERE id = ?`, [id]
    );

    return result.affectedRows > 0; 
}

// Creating a post after a post request has been mad
async function createPost(title, content, category, author_id, author_username) {
  const [result] = await connPool.query(
    `INSERT INTO posts (title, content, category, author_id, author_username)
     VALUES (?, ?, ?, ?, ?)`,
    [title, content, category, author_id, author_username]
  );

  return result.insertId;
}

async function getPost(id) {
  const [rows] = await connPool.query(
    `SELECT * FROM posts WHERE id = ?`,
    [id]
  );
  return rows[0] ?? null;
}

async function updatePost(id, title, category, content) {
    const [result] = await connPool.query(
        `UPDATE posts SET title = ?, category = ?, content = ? WHERE id = ?`,
        [title, category, content, id]
    );

    return result.affectedRows === 1;
}

async function deletePost(id) {
    try {

        await connPool.query(`DELETE FROM comments WHERE post_id = ?`, [id]);

        const [result] = await connPool.query(
            `DELETE FROM posts WHERE id = ?`,
            [id]
        );

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting post:", error);
        return false;
    }
}

async function getRecentPosts() {
    const [rows] = await connPool.query(
        "SELECT * FROM posts ORDER BY publication_date DESC LIMIT 6"
    );
    return rows;
}

async function getPosts(search, category) {
  let sql = `SELECT * FROM posts`;
  let args = [];

  if (search) {
    sql += " WHERE title LIKE ?";
    args.push(`%${search}%`);
  }

  if (category) {
    sql += args.length ? " AND category = ?" : " WHERE category = ?";
    args.push(category);
  }

  sql += " ORDER BY publication_date DESC";

  const [rows] = await connPool.query(sql, args);
  return rows;
}

async function addComment(post_id, user_id, username, content) {
  const [result] = await connPool.query(
    `INSERT INTO comments (post_id, user_id, username, content)
     VALUES (?, ?, ?, ?)`,
    [post_id, user_id, username, content]
  );

  return result.insertId;
}

async function getComment(com_id) {
    const [result] = await connPool.query(
        `SELECT * from comments WHERE id = ?`, [com_id]
    );

    return result[0] || null;
}

async function deleteComment(com_id) {
    const [result] = await connPool.query(
        `DELETE FROM comments WHERE id = ?`,
        [com_id]
    );

    return result.affectedRows > 0;
}

async function updateComment(id, content) {
    const [result] = await connPool.query(
        'UPDATE comments SET content = ? WHERE id = ?',
        [content, id]
    );
    return result.affectedRows > 0;
}

async function getCommentsForPost(post_id) {
  const [rows] = await connPool.query(
    `SELECT * from comments WHERE post_id = ? ORDER BY created_at DESC`,
    [post_id]
  );

  return rows;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  activateAdmin,

  createPost,
  getPost,
  updatePost,
  deletePost,
  getRecentPosts,
  getPosts,

  addComment,
  getCommentsForPost,
  getComment,
  updateComment,
  deleteComment
};
