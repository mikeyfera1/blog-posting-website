document.addEventListener("DOMContentLoaded", () => {
    const deleteButton = document.getElementById("delete");
    const deleteCommentButtons = document.querySelectorAll(".delete-comment");
    const editCommentButtons = document.querySelectorAll(".edit-comment");
    const saveCommentButtons = document.querySelectorAll(".save-comment");
    const cancelEditButtons = document.querySelectorAll(".cancel-edit");


    // For new comments made on the spot, attach listeners so edit and delete buttons work
    function attachCommentListeners(commentElement) {
        const editBtn = commentElement.querySelector(".edit-comment");
        const saveBtn = commentElement.querySelector(".save-comment");
        const cancelBtn = commentElement.querySelector(".cancel-edit");
        const deleteBtn = commentElement.querySelector(".delete-comment");
        
        if (editBtn) {
            editBtn.addEventListener("click", (e) => {
                const commentDiv = editBtn.closest(".comment");
                const contentP = commentDiv.querySelector(".comment-content");
                const textarea = commentDiv.querySelector(".comment-edit");
                const saveBtnLocal = commentDiv.querySelector(".save-comment");
                const cancelBtnLocal = commentDiv.querySelector(".cancel-edit");
                
                contentP.style.display = "none";
                editBtn.style.display = "none";
                textarea.style.display = "block";
                saveBtnLocal.style.display = "inline-block";
                cancelBtnLocal.style.display = "inline-block";
                
                textarea.focus();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener("click", async (e) => {
                const commentDiv = saveBtn.closest(".comment");
                const id = commentDiv.dataset.commentId;
                const textarea = commentDiv.querySelector(".comment-edit");
                const newContent = textarea.value.trim();
                
                if (!newContent) {
                    showCustomAlert("Comment can't be empty", false);
                    return;
                }
                
                try {
                    const response = await fetch(`/api/comment/${id}/edit`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: newContent })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        showCustomAlert(data.message, false);                    }
                } catch (error) {
                    console.error("Error:", error);
                    showCustomAlert("Something went wrong", false);
                }
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener("click", (e) => {
                const commentDiv = cancelBtn.closest(".comment");
                const contentP = commentDiv.querySelector(".comment-content");
                const textarea = commentDiv.querySelector(".comment-edit");
                const editBtn = commentDiv.querySelector(".edit-comment");
                const saveBtnLocal = commentDiv.querySelector(".save-comment");
                
                textarea.value = contentP.textContent;
                
                contentP.style.display = "block";
                editBtn.style.display = "inline-block";
                textarea.style.display = "none";
                saveBtnLocal.style.display = "none";
                cancelBtn.style.display = "none";
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener("click", async (e) => { 
                const commentDiv = deleteBtn.closest(".comment");
                const id = commentDiv.dataset.commentId;
                
                try {
                    const response = await fetch(`/api/delete/comment`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id })
                    });
                    const data = await response.json();
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        showCustomAlert(data.message, false);
                    }
                } catch (error) {
                    console.error("Error:", error);
                    showCustomAlert("Something went wrong.", false);
                }
            });
        }
    }

    // To get the comment form for posting a comment
    const commentForm = document.getElementById("comment-form");

    if (commentForm) {
        commentForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const textarea = document.getElementById("comment-textarea");
            const content = textarea.value.trim();
            
            if (!content) {
                showCustomAlert("Comment can't be empty", false);
                return;
            }

            const postId = commentForm.action.split("/")[4];

            try {
                const response = await fetch(`/post/${postId}/comment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content })
                });

                const data = await response.json();

                if (response.ok) {
                    textarea.value = "";

                    const noComments = document.getElementById("no-comments");
                    if (noComments) {
                        noComments.remove();
                    }

                    const commentsHeader = document.querySelector(".card-header h2");
                    const currentCount = parseInt(commentsHeader.textContent.match(/\d+/)[0]);
                    commentsHeader.textContent = `Comments (${currentCount + 1})`;

                    const commentsContainer = document.getElementById("comments-container");
                    const commentHTML = createCommentElement(data.comment);
                    commentsContainer.insertAdjacentHTML('afterbegin', commentHTML);

                    const newComment = commentsContainer.firstElementChild;
                    attachCommentListeners(newComment);
                    newComment.scrollIntoView({ behavior: 'smooth' });
                } else {
                    showCustomAlert(data.message || "Something went wrong. Please try again.", false);
                }
            } catch (error) {
                console.error("Error:", error);
                showCustomAlert(data.message || "Something went wrong. Please try again.", false);
            }
        })
    }

    function createCommentElement(comment) {
        const date = new Date(comment.created_at).toLocaleDateString();
        const currentUser = document.querySelector(".navbar-user")?.textContent.trim();
        const isOwner = currentUser && (currentUser.includes(comment.username) || currentUser.includes("Admin"));
        
        return `<div class="comment" style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #333;" data-comment-id="${comment.id}"><strong>💻  ${comment.username}</strong><span class="text-secondary" style="margin-left: 10px;">${date}</span><p class="comment-content">${comment.content}</p><textarea class="form-textarea comment-edit" style="display: none; width: 100%; margin-top: 10px; margin-bottom: 10px;" rows="4">${comment.content}</textarea>${isOwner ? `<button class="btn btn-small btn-secondary edit-comment" style="margin-top: 10px;">Edit</button><input type="hidden" class="comment-id" value="${comment.id}"><button class="btn btn-small btn-primary save-comment" style="display: none; margin-left: 5px;">Update</button><button class="btn btn-small btn-secondary cancel-edit" style="display: none; margin-left: 5px;">Cancel</button><button class="btn btn-small btn-danger delete-comment" style="margin-left: 10px; margin-top: 10px;">Delete</button>` : ''}</div>`;
    }

    // If the user wantws to delete their own post
    if (deleteButton) {
        deleteButton.addEventListener("click", async () => {
            showCustomAlert(
                "Are you sure you want to delete this post? This action cannot be undone.",
                true,
                async () => {
                    const id = document.getElementById("postId").value;
                    try {
                        const response = await fetch(`/api/delete`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id })
                        });
            
                        const data = await response.json();
            
                        if (response.ok) {
                            showCustomAlert("Post deleted successfully!", false, () => {
                                window.location.href = `/browse`;
                            });
                        } else {
                            showCustomAlert(data.message || "Something went wrong. Please try again.", false);
                        }
                    } catch (error) {
                        console.error("Error", error);
                        showCustomAlert("Something went wrong. Please try again", false);
                    }
                }
            );
        });
    }

    // If a user or admin wants to delete comments of their own
    if (deleteCommentButtons) {
        deleteCommentButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                e.preventDefault();

                const id = button.parentElement.querySelector(".comment-id").value;

                try {
                    const response = await fetch(`/api/delete/comment`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id })
                    });

                    const data = await response.json();

                    if (response.ok) {
                        window.location.href = `/post/${data.message}`;
                    } else {
                        showCustomAlert(data.message, false);              
                    }

                } catch (error) {
                    console.error("Error:", error);
                    showCustomAlert("Something went wrong", false);
                }
            });
        });
    }

    // For any comment that has an edit button and when its press, switches the text to input
    if (editCommentButtons) {
        editCommentButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const commentDiv = button.closest(".comment");
                const contentP = commentDiv.querySelector(".comment-content");
                const textarea = commentDiv.querySelector(".comment-edit");
                const saveBtn = commentDiv.querySelector(".save-comment");
                const cancelBtn = commentDiv.querySelector(".cancel-edit");
                
                contentP.style.display = "none";
                button.style.display = "none";
                textarea.style.display = "block";
                saveBtn.style.display = "inline-block";
                cancelBtn.style.display = "inline-block";
                
                textarea.focus();
            });
        });
    }

    // For when the user wants to save changes to their edited comment
    if (saveCommentButtons) {
        saveCommentButtons.forEach(button => {
            button.addEventListener("click", async (e) => {
                const commentDiv = button.closest(".comment");
                const id = button.parentElement.querySelector(".comment-id").value;
                const textarea = commentDiv.querySelector(".comment-edit");
                const newContent = textarea.value.trim();
                
                if (!newContent) {
                    showCustomAlert("Comment cannot be empty", false);
                    return;
                }
                
                try {
                    const response = await fetch(`/api/comment/${id}/edit`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ content: newContent })
                    });
                    
                    const data = await response.json();
                    if (response.ok) {
                        window.location.reload();
                    } else {
                        showCustomAlert(data.message, false);
                    }
                } catch (error) {
                    console.error("Error:", error);
                    showCustomAlert("Something went wrong.", false);
                }
            });
        });
    }
    
    // When a user wants to cancel their edit for a comment
    if (cancelEditButtons) {
        cancelEditButtons.forEach(button => {
            button.addEventListener("click", (e) => {
                const commentDiv = button.closest(".comment");
                const contentP = commentDiv.querySelector(".comment-content");
                const textarea = commentDiv.querySelector(".comment-edit");
                const editBtn = commentDiv.querySelector(".edit-comment");
                const saveBtn = commentDiv.querySelector(".save-comment");
                
                textarea.value = contentP.textContent;
                
                contentP.style.display = "block";
                editBtn.style.display = "inline-block";
                textarea.style.display = "none";
                saveBtn.style.display = "none";
                button.style.display = "none";
            });
        });
    }

    // function to add alert box for when you delete a post
    function showCustomAlert(message, isConfirm, onConfirm) {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        
        const alertBox = document.createElement("div");
        alertBox.style.cssText = `
            background: #16213e;
            border-radius: 20px;
            padding: 32px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
            border: 1px solid #2d1b69;
            text-align: center;
        `;
        
        const messageEl = document.createElement("p");
        messageEl.textContent = message;
        messageEl.style.cssText = `
            color: #ffffff;
            font-size: 18px;
            margin-bottom: 20px;
            line-height: 1.6;
        `;
        
        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = `
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 20px;
        `;
        
        if (isConfirm) {
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancel";
            cancelButton.className = "btn btn-secondary btn-small";
            cancelButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
            });
            
            const confirmButton = document.createElement("button");
            confirmButton.textContent = "Delete";
            confirmButton.className = "btn btn-danger btn-small";
            confirmButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
                if (onConfirm) onConfirm();
            });
            
            buttonContainer.appendChild(cancelButton);
            buttonContainer.appendChild(confirmButton);
        } else {
            const okButton = document.createElement("button");
            okButton.textContent = "OK";
            okButton.className = "btn btn-primary";
            okButton.addEventListener("click", () => {
                document.body.removeChild(overlay);
                if (onConfirm) onConfirm();
            });
            
            buttonContainer.appendChild(okButton);
        }
        
        alertBox.appendChild(messageEl);
        alertBox.appendChild(buttonContainer);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
    }

})