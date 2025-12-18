const express = require("express");
const app = express();
const port = 4131;

const db = require("./data.js");
const session = require("express-session");

app.set("views", "templates");
app.set("view engine", "pug");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/html", express.static("html"));
app.use(express.static("resources"));

// DISPLAYING REQUESTS BEING SENT
app.use((req, res, next) => {
    res.on("finish", async () => {
        const method = req.method;
        const url = req.originalUrl;
        const status = res.statusCode;
        try {
            console.log(`"${method} ${url} HTTP/1.1" ${status}`);
        } catch (err) {
            console.log(`"${req.method} ${req.originalUrl} HTTP/1.1" ${res.statusCode}`);
        }
    });

    next();
});
  
// MIDDLEWARE FOR EXPRESS-SESSION
app.use(
    session({
        secret: "p1ttsburghistheb8stc1ty",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true
        }
    })
);

// To make req.user header the current session user
app.use((req, res, next) => {
    req.user = req.session.user || null;
    next();
});

// **ALL GET REQUESTS** (home, browse, post, create/edit posts, login/logout, and register)
app.get(["/", "/home"], async (req, res) => {
    try {
        const recentPosts = await db.getRecentPosts();
        res.render("home.pug", { posts: recentPosts, user: req.user });
    } catch (error) {
        const recentPosts = [];
        res.render("home.pug", { posts: recentPosts, user: req.user });
    }
});

// GET the browsing page
app.get("/browse", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const postsPerPage = 9;

    const searchQuery = req.query.search || "";
    const categoryFilter = req.query.category || "";

    try {
        let filteredPosts = await db.getPosts(searchQuery, categoryFilter);

        const totalPosts = filteredPosts.length;
        const totalPages = Math.ceil(totalPosts / postsPerPage);
        const currentPage = Math.max(1, Math.min(page, totalPages));
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);


        res.render("browse.pug", { posts: paginatedPosts, currentPage, totalPages, searchQuery, categoryFilter, totalResults: totalPosts, user: req.user, hasAnyPosts: true });
    } catch (error) {
        res.render("browse.pug", { posts: [], hasAnyPosts: false, user: req.user });
    }
});

// GET each individual post
app.get("/post/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const post = await db.getPost(id);

        if (!post) {
            return res.status(404).render("404.pug");
        }

        const emojis = {
            "drama": "🎭",
            "comedy": "😂",
            "scifi": "👽",
            "reality": "🧑‍🤝‍🧑",
            "thriller": "🧟‍♂️"
        };

        const emoji = emojis[post.category.toLowerCase()];

        const postComments = await db.getCommentsForPost(post.id);

        res.render("post.pug", { post, emoji, comments: postComments, user: req.user })
    } catch (error) {
        res.status(404).render("404.pug");
    }   
});


// GET create post page
app.get("/create", (req, res) => {
    res.render("create.pug", { user: req.user });
});

// GET edit post page
app.get("/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    const post = await db.getPost(id);

    if (!post) {
        return res.status(404).render("404.pug");
    }

    if (!req.user || (req.user.id !== post.author_id && !req.user.is_admin)) {
        return res.status(403).render("403.pug");
    }

    res.render("edit.pug", { user: req.user, post });
});

// GET login page
app.get("/login", (req, res) => {
    res.render("login.pug");
});

// GET logout page (destroying current session)
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// GET register page
app.get("/register", (req, res) => {
    res.render("register.pug");
});

// GET super secrete page (to escalate to admin status)
app.get("/squigglycrane30", async (req, res) => {
    if (!req.user) {
        return res.render("secret.pug", { message: "Need to be signed in first 🤫"});
    }

    try {
        await db.activateAdmin(req.user.id);
        req.user.is_admin = true;
        res.render("secret.pug", { user: req.user, message: "Glad you made it to the Admin Squad 🤝" });
    } catch (error) {
        res.render("secret.pug", { message: "It seems there was an error giving you Admin status 🤔"});
    }
});

// ALL POST REQUESTS (register, login, create/edit/delete posts, create/edit/delete comments)
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUserByUsername(username);

        if (user) {
            return res.status(400).json({ message: "Username already taken." });
        }

        const userId = await db.createUser(username, password);

        if (userId) {
            return res.status(201).json({ message: "User created successfully." });
        } else {
            return res.status(500).json({ message: "Something went wrong. Please try again."});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST to login a user
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await db.getUserByUsername(username);

        if (!user) {
            return res.status(400).json({ message: "Invalid Username" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            is_admin: user.is_admin
        };

        return res.status(200).json({ message: "Logged in successfully." });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})

// POST to create a new post by a user
app.post("/api/create", async (req, res) => {
    const { title, category, content } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Need to be signed in to post" });
    }
    try {
        const user = await db.getUserById(req.user.id);

        const id = await db.createPost(title, content, category, user.id, user.username);

        if (!id) {
            return res.status(400).json({ message: "There was an error trying to post" });
        }

        return res.status(201).json({ message: id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST to edit a post by a user
app.post("/api/edit/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, category, content } = req.body;

    try {
        const user = await db.getUserById(req.user.id);

        if (!user) {
            return res.status(401).json({ message: "Not logged in" });
        }

        const post = await db.getPost(id);

        if (!post) {
            return res.status(400).json({ message: "Post not found" });
        }

        if (req.user.id !== post.author_id && !req.user.is_admin) {
            return res.status(403).json({ message: "Unauthroized" });
        }

        const success = await db.updatePost(id, title, category, content);

        if (success) {
            return res.status(200).json({ message: id });
        } else {
            return res.status(500).json({ message: "Failed to update post" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// POST to post a new comment
app.post("/post/:id/comment", async (req, res) => {
    const id = parseInt(req.params.id);

    if (!req.user) {
        return res.status(401).json({ message: "Need to be logged in" });
    }
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }

    try {
        const commentId = await db.addComment(id, req.user.id, req.user.username, content.trim());
    
        if (!commentId) {
            return res.status(400).json({ message: "Could not add comment." });
        }

        const newComment = await db.getComment(commentId);
        res.status(201).json({ 
            success: true, 
            comment: newComment
        });

    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ALL DELETE REQUESTS (deleteing comments and posts)
app.delete("/api/delete/comment", async (req, res) => {
    let { id } = req.body;

    id = parseInt(id);

    if (!req.user) {
        return res.status(400).json({ message: "Need to be signed in" });
    }

    try {
        const comment = await db.getComment(id);

        if (!comment) {
            return res.status(400).json({message: "Comment does not exist" });
        }

        if (req.user.id !== comment.user_id && !req.user.is_admin) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const success = await db.deleteComment(id);

        if (success) {
            res.status(200).json({ message: comment.post_id });
        } else {
            res.status(400).json({ message: "Could not delete comment" });
        }

    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).send("Internal server error");
    }
});

// DELETE post to delete a post
app.delete("/api/delete", async (req, res) => {
    let { id } = req.body;

    id = parseInt(id);

    if (!req.user) {
        return res.status(400).json({ message: "Need to be signed in" });
    }

    try {
        const post = await db.getPost(id);

        if (!post) {
            return res.status(400).json({ message: "Post does not exist" });
        }

        if (req.user.id !== post.author_id && !req.user.is_admin) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        const success = await db.deletePost(id);

        if (success) {
            return res.status(200).json({ message: "Successfully deleted post!" });
        } else {
            return res.status(400).json({ message: "Unable to delete post" })
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).send("Internal server error");
    }
});

// ALL PUT requests (to update a comment for a post)
app.put("/api/comment/:id/edit", async (req, res) => {
    let id = parseInt(req.params.id);
    let { content } = req.body;
    
    if (!req.user) {
        return res.status(400).json({ message: "Need to be signed in" });
    }
    
    if (!content || !content.trim()) {
        return res.status(400).json({ message: "Comment cannot be empty" });
    }
    
    try {
        const comment = await db.getComment(id);
        if (!comment) {
            return res.status(400).json({ message: "Comment does not exist" });
        }
        if (req.user.id !== comment.user_id && !req.user.is_admin) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        
        const success = await db.updateComment(id, content.trim());
        if (success) {
            res.status(200).json({ message: "Comment updated successfully" });
        } else {
            res.status(400).json({ message: "Could not update comment" });
        }
    } catch (error) {
        console.error("Error updating comment:", error);
        res.status(500).send("Internal server error");
    }
});

// If page does not exist, return a 404 error
app.use((req, res) => {
    res.status(404).render("404.pug");
});

// To listen to the given port
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});