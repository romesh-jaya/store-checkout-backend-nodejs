# Backend for Movie Store - NodeJS

Runs a node.js server as the backend, interfacing with postgres. 

## Technical details

- Verifies JWT tokens passed in with the requests and also authorizes certain actions which require higher privileges.
- Fetches latest title data from OMDB.
- Uses mongoose-sequence plugin to create auto incrementing fields. 
- Includes backend functionality for Stripe payments including a webhook.
- Includes backend functionality for Paypal payments including a webhook.
- Uses Nodemailer to send emails


## .env variables

All fields mentioned in nodemon.json.example must be filled with correct values and renamed as nodemon.json. 

    - MONGOENDPOINT - Mongo DB Atlas connection string
    - STARTPORT - Port that this server will run on. Will be overriden by PORT
    - ADMIN_USER - email address of the user with Admin rights
    

## Available Scripts

In the project directory, you can run:

### `npm run start:server`

Runs the app in the development mode. Uses variables from nodemon.json.<br />

### `npm start`

Starts the app. Need to manually set environment variables.

## Deployment

Whenever a git commit is done, project will auto deploy.




