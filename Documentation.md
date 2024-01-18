# 8.1 Verfahren von Speicherung der Passwörter

# 8.2 Bibliotheken und externe Code-Bestandteile

# 8.3 Schutz gegen XSS-Attacken

# 8.4 Zugangsdaten

For the sake of fulfilling the requirement 8.4, two users will be seeded for testing purposes. These are their login information:

| Role  | Username | Password        |
| ----- | -------- | --------------- |
| Admin | admin    | \#S3$UZe2K2*xjG |
| User  | username | \#S3$UZe2K2*xjG |

As already mentioned, the phone numbers for those users is defined using environment variables that are defined in the [.env-File](./source/server/.env). Make sure to change these accordingly before the seeding happens, in order to receive the 2FA SMS token.
