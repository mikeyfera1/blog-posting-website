document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    // When the user registers an account
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        if (!username || !password) {
            showCustomAlert("Username and Password are required", false);
            return;
        }

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                showCustomAlert("Account created successfully! Redirecting to login...", true);
            } else {
                showCustomAlert(data.message || "Something went wrong. Please try again.", false);
            }
        } catch (error) {
            console.error("Error", error);
            showCustomAlert("Something went wrong. Please try again", false);
        }
    })

    function showCustomAlert(message, autoRedirect) {
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
        button.textContent = autoRedirect ? "Go to Login Now" : "OK";
        button.className = "btn btn-primary";
        button.style.cssText = `
            margin-top: 12px;
        `;
        
        button.addEventListener("click", () => {
            document.body.removeChild(overlay);
            if (autoRedirect) {
                window.location.href = "/login";
            }
        });
        
        alertBox.appendChild(messageEl);
        alertBox.appendChild(button);
        overlay.appendChild(alertBox);
        document.body.appendChild(overlay);
        
        if (autoRedirect) {
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                    window.location.href = "/login";
                }
            }, 2000);
        }
    }
})