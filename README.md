# Store Checkout Backend - NodeJS

Runs a node.js server as the backend, interfacing with postgres. 

## Tech stack

- Sequelize ORM
- JWT creation and verification along with long-lived refresh tokens


## .env variables

All fields mentioned in nodemon.json.example must be filled with correct values and renamed as nodemon.json. 

    - DB_CONN_STRING - Postgres connection string
    - STARTPORT - Port that this server will run on. Will be overriden by PORT
    - ADMINUSER - email address of the user with Superadmin rights
    

## Available Scripts

In the project directory, you can run:

### `npm run start:server`

Runs the app in the development mode. Uses variables from nodemon.json.<br />

### `npm start`

Starts the app. Need to manually set environment variables.

## Deployment

Whenever a git commit is done, project will auto deploy.




