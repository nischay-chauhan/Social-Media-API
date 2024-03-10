
# Social Media API

Its a Node js backend API for a Social media Application. It make use of the Mongodb and the Aggregation Pipelines for querying and fetching data. It have many features like register , login , update and delete User. Along with Create , update , delete Posts that a User can make. Followers and Following Functionality is also there. Get Yourself Specific feed based on the user you follow.




## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`MONGO_URL = <Your mongoDb database URL>`

`PORT = <Your PORT>`

`ACCESS_TOKEN_SECRET = <Your_Access_Token>`

`ACCESS_TOKEN_EXPIRY = Your ACCESS_TOKEN_EXPIRY`

`REFRESH_TOKEN_SECRET = Your REFRESH_TOKEN_SECRET`

`REFRESH_TOKEN_EXPIRY=Your <REFRESH_TOKEN_EXPIRY>`

`CLOUDINARY_CLOUD_NAME = <Your CLOUDINARY_CLOUD_NAME>`

`CLOUDINARY_API_KEY = Your CLOUDINARY_API_KEY`

`CLOUDINARY_API_SECRET = Your CLOUDINARY_API_SECRET`
## Features

### User Management:
- Register: Users can register on the platform by providing their full name, email, username, password, and avatar.
- Login: Registered users can log in using their email and password.
- Logout: Users can securely log out from their accounts.
- Profile Management: Users can view their profile details and update their account information, including full name and email.
- Avatar Update: Users can update their profile avatar by uploading a new image.
- Following/Followers: Users can follow other users to see their posts in their social feed and view their list of followers and users they are following.
### Post Management:
- Create Post: Users can create new posts by adding content and optionally attaching media.
- Edit Post: Users can edit their own posts to update the content.
- Delete Post: Users can delete their own posts.
- View Specific User Posts: Users can view posts posted by a specific user.
- Social Feed: Users can view posts from users they are following in their social feed, sorted by the most recent.


## Tech Stack

- **Server**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Image Upload**: Multer for handling multipart/form-data uploads
- **Cloud Storage**: Cloudinary for storing uploaded images
- **Pagination**: mongoose-aggregate-paginate-v2 for efficient pagination
- **Error Handling**: Custom error handling using ApiError and ApiResponse classes
## ENDPOINTS

- **POST /register**: Register a new user.
- **POST /login**: Login with email and password.
- **POST /logout**: Logout the current user.
- **GET /profile**: Get the profile details of the current user.
- **PATCH /update-account**: Update account details of the current user.
- **PATCH /avatar**: Update the avatar image of the current user.
- **POST /follow/:userId**: Follow a user by their user ID.
- **POST /unfollow/:userId**: Unfollow a user by their user ID.
- **GET /following**: Get the list of users followed by the current user.
- **GET /followers**: Get the list of users following the current user.
- **POST /content**: Create a new post.
- **GET /:id/posts**: Get posts posted by a specific user.
- **PATCH /:id/update**: Update a post by its ID.
- **DELETE /:id/delete**: Delete a post by its ID.
- **GET /feed**: Get social feed posts of the current user, sorted by most recent.
## Run Locally

Clone the project

```bash
  git clone https://github.com/nischay-chauhan/Social-Media-API.git
```



Install dependencies

```bash
  npm install
```

- Start the server

- Make the .env file in the root directory that is outside the src directory
- Put all the ENV variables in it

```bash
  npm run dev 
```

