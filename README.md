# M183_Posts

## Setup & startup

### Server

* `cd .\source\server\` to enter the server app
* `npm i` to install all dependencies
* `npm start` to start the server

### Client

* `cd .\source\client\` to enter the client app
* `npm i` to install all dependencies
* `npm run dev` to start the client

## Security notice

### Environment variables

We are using environment variables to store secrets like the JWT secret. Normally you would not commit these files to the repository, but we did it for the sake of simplicity. We are aware that this is not a good practice and we would not do it in a real project.

