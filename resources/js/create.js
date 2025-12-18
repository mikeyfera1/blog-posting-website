document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    // If the user creates a post
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const title = document.getElementById("title").value.trim();
        const category = document.getElementById("category").value;
        const content = document.getElementById("content").value;

        if (!title || !category || !content) {
            showCustomAlert("Title , category, and content required", null);
            return;
        }

        try {
            const response = await fetch("/api/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, category, content })
            });

            const data = await response.json();

            if (response.ok) {
                showCustomAlert("Post created successfully!", `/post/${data.message}`);
            } else {
                showCustomAlert(data.message || "Something went wrong. Please try again.", null);
            }
        } catch (error) {
            console.error("Error", error);
            showCustomAlert("Something went wrong. Please try again", null);
        }
    })

    // Function to showcase alert box when a user submits a post
    function showCustomAlert(message, redirectUrl) {
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
        
        const button = document.createElement("button");
        button.textContent = redirectUrl ? "Go to Post" : "OK";
        button.className = "btn btn-primary";
        button.style.cssText = `
            margin-top: 12px;
        `;
        
        button.addEventListener("click", () => {
            document.body.removeChild(overlay);
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        });
        
        alertBox.appendChild(messageEl);
        alertBox.appendChild(button);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
    }
});