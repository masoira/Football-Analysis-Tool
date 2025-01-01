## Development Setup

### Requirements
- Install Node.js and npm (https://nodejs.org/)

### Frontend Setup
1. cd into frontend folder
  `cd frontend`

2. Install dependencies 
  `npm install`

3. Create a copy of `.env.example` and name it to `.env`

4. Start the development server
  `npm run dev`

Note: Always run npm commands from the frontend folder where package.json is located (not from the root of the repo).

5. Testing
  `npm run test`


### Users

We have set up a Supabase project with GitHub OAuth enabled. From a user we get only their email, but we use this later to save match data for users.

## Plan:

#### short-term
- Use hover to display xG instead of always displaying them
- refactor xG calculations to be more modular to allow different pitch sizes based on screens sizes

#### long-term
- Better state management in the frontend - dont modify global actions array
- Decision between vanilla JS / React, no hybrid
- Backend for user management and storage
- DB for storage
- Tests
