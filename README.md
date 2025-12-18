# Welcome to StreamVerse (Guide)
#### The newest blog platform to share your opinions on any movie and/or tv show ever created!!
## 1. Set Up
### 1. Needed packages to run application
- After downloading StreamVerse's files, run
    ```
    npm install
    ```
    - Or if needed, install the packages separately:
        ```
        npm install express
        npm install express-session
        npm install pug
        npm install mysql2
        ```
    - If using tunnel.js file, then:
        ```
        npm install tunnel-ssh
        npm install prompt
        ```

### 2. To run StreamVerse software
- To run the software:
    1. connect to the CSE Labs machine via tunnel.js or running it locally
    2. Run the command
        ```
        node server.js
        ```
    - All the information for the mySQL database should be in the data.js file given

## 2. Features of StreamVerse
### 1. Home Page
- Shows the most recent posts made by our users
### 2. Browse Page
- Showcases all the posts made by users, where each user can search via **Title** and **Category** or explore the various pages on the browsing page
### 3. Create Post Page
- Allows users to post their own blog posts via a form (if signed in)
### 4. Edit Post Page
- Allows users to edit their own blog posts via a form (admins also have access)
### 5. Post Page
- Each post gets its own page that displays its contents, as well as a comment section and comment form for signed in users or admins to fill out
### 6. Login Page
- If a user has an account, they can log in via the login page
### 7. Register Page
- Allows user to make an account for our StreamVerse service
### 8. Logout Page
- Allows a user to log out if they are signed into an account

## 3. How To Register/Login
### 1. Go to Register page
- Fill out your username and a password (any is fine)
### 2. Once registered, it redirects to Login
- Fill out the Login page with the same username and password
### 3. Once logged in, it redirects you to the Home Page
- YIIPEEE, you can use StreamVerse features

## 4. How to Post
### 1. Go to Create Post
- Fille out required fields (title, category, and content) and hit create post

## 5. How to Comment
### 1. Go to any post on the Home/Browse Page
- Go slightly down passed the post info and fill out the comment form and press **Post Comment**

## 6. How to Edit/Delete Posts and Comments
### 1. Click on a Post you made
- Buttons should be displayed on the post page (Edit and Delete)
    - **Edit** -> Brings you to the edit page to edit post information
    - **Delete** -> Will delete the post and bring you back to the home page

### 2. For Comments
- Go to a post where you commented and the same Edit and Delete buttons will appear

## 7. How to access Admin Status
1. Go to this specific page
    ```
    http:localhost:4131/squigglycrane30
    ```
    - Fun Fact: That's my old xbox accoutn username 
2. Once you visit the page, you can go to any page and you will be granted Admin Status

## 8. Additional Features 
- Wanted to share some additional features I added that I needed extra documentation to do
    1. Used color gradients for text in CSS file - **linear-gradient()**
        - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/gradient/linear-gradient
    2. Used webkit to apply gradients to headers and text - **-webkit**
        - https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Pseudo-elements
    3. Used Grid display for posts in CSS file - **display: grid**
        - https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout

# End of Guide
Hopefully that is enough to test everything for my blog posting website!!