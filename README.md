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

Also the GIBZ-API-KEY and the phone number for the initial users are declared using environment variables. This allows us to easily test the application with different GIBZ-Accounts and phone numbers.

## Default login information

For the sake of fulfilling the requirement 8.4, two users will be seeded for testing purposes. These are their login information:

| Role  | Username | Password        |
| ----- | -------- | --------------- |
| Admin | username | \#S3$UZe2K2*xjG |
| User  | admin    | \#S3$UZe2K2*xjG |

As already mentioned, the phone numbers for those users is defined using environment variables that are defined in the [.env-File](./source/server/.env). Make sure to change these accordingly before the seeding happens, in order to receive the 2FA SMS token.
