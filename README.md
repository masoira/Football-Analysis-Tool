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


### Backend Setup
1. cd into backend folder
  `cd backend`

2. Install dependencies
  `pip install -e .`

3. Create a copy of `.env.example` and name it to `.env`

4. Start the backend server
  `python src/main.py`
  - You can access the Swagger docs by adding "/docs" to the ends of the base url

5. Test the backend
  Once the backend server is running you can authenticate on Swagger page by manually creating a test token running:
  `python src/manual_test_file.py`

### Users

We have set up a Supabase project with GitHub OAuth enabled. From a user we get only their email, but we use this later to save match data for users.

## Plan:

#### short-term
- Use hover to display xG instead of always displaying them
- refactor xG calculations to be more modular to allow different pitch sizes based on screens sizes

#### long-term
- Better state management in the frontend - dont modify global actions array
- Decision between vanilla JS / React, no hybrid
- DB for storage
- Tests
