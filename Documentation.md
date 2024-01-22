# 8.1 Verfahren von Speicherung der Passwörter

Um das Passwort auf eine sichere Art und Weise zu speichern, speicherten wir das Passwort nicht als Plain-Text in der Datenbank ab.

Bevor das Passwort jedoch überhaupt in den Abspeicherungs-Prozess gelangt, wird es auf die geforderte Komplexität geprüft. Die Anforderungen sind:

- Mindestlänge von 12 Zeichen
- Einen Grossbuchstaben
- Einen Kleinbuchstaben
- Eine Ziffer
- Einen Spezialcharakter

Erfüllt das Passwort alle Anforderungen, wird dem Passwort ein Pepper hinzugefügt, was im Anschluss gesalted und gehashed wird. Das gehashte Ergebnis, bestehend aus dem Passwort, dem Pepper und dem Salt, wird anschliessend in die Datenbank gespeichert.

Der Pepper besteht lediglich aus einem Text, der im .env-File abgespeichert wird. Standardmässig ist der Wert des Peppers "rCjaz&iqu96ZE%!sLZz!". Für die Speicherung des Peppers wird zwar kein Key Management System verwendet, jedoch wird der Pepper immerhin als Umgebungsvariable verwendet und ist nicht im Quellcode hardcoded. Anders als bei beispielsweise dem Verfahren zur Passwortspeicherung von Dropbox, kann der Pepper in unserer Applikation sehr schwer rotiert werden, was verbessert werden könnte.

Gehashed wird die Kombination des Passworts und des Peppers mit dem bcrypt-Algorithmus, welcher das Salting automatisch mitintegriert. Der Hash-Vorgang wird mit 12 Runden durchgeführt (oder einem Cost von 12), womit die Berechnungszeit des Hashes durchschnittlich bei länger als 250ms liegen sollte. Für solch ein Projekt wie diesem ist die Berechnungsdauer langsam genug.

Auch wenn weitere Verbesserungsmöglichkeiten bestehen würden, sind wir der Meinung, dass dieses Verfahren für eine Applikation zur Erstellung von Posts sicher genug ist.

# 8.2 Bibliotheken und externe Code-Bestandteile

- Backend
    - [bcrypt](https://www.npmjs.com/package/bcrypt): 
        - Bcrypt wird verwendet, um das Passwort zu hashen und zu salten.

    - [cookie-parser](https://www.npmjs.com/package/cookie-parser): 
        - Cookie-Parser wird verwendet, um Cookies zu verarbeiten.

    - [dotenv](https://www.npmjs.com/package/dotenv): 
        - Detenv wird verwendet, um Umgebungsvariablen zu laden und verwenden.

    - [express](https://www.npmjs.com/package/express): 
        - Express wird verwendet, um den API-Server zu erstellen.

    - [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): 
        - Jsonwebtoken wird verwendet, um JWTs zu erstellen und zu verifizieren. Diese werden für die Authentifizierung verwendet.

    - [node-2fa](https://www.npmjs.com/package/node-2fa): 
        - Node-2fa wird verwendet, um 2FA-Tokens zu erstellen und zu verifizieren. Dies wird bei den Admins, beim veröffentlichen eines Posts verwendet.

    - [sequelize](https://www.npmjs.com/package/sequelize): 
        - Sequelize ist ein Datenbank-ORM (Object-Relational-Mapper) welches die Interaktion mit der Datenbank vereinfacht.

    - [sqlite3](https://www.npmjs.com/package/sqlite3): 
        - Sqlite3 wird verwendet, um die Datenbank zu erstellen und zu verwalten.

    - [validator](https://www.npmjs.com/package/validator): 
        - Validator wird verwendet, um die Eingaben der Benutzer zu validieren. 

    - [winston](https://www.npmjs.com/package/winston): 
        - Winston wird verwendet, um Logs zu erstellen.

    - [nodemon](https://www.npmjs.com/package/nodemon):
        - Nodemon wird für das automatische Neustarten des Dev-Servers bei Änderungen verwendet.

- Frontend
  - Selbst hinzugefügte Libraries:
    - [@emotion/css](https://www.npmjs.com/package/@emotion/css): 
      - Emotion-CSS wird verwendet um das Styling der Komponenten zu vereinfachen. Es ermöglicht das Verwenden des standard CSS-Syntaxes anstelle der eher mühsamen Schreibweise in React. 

    - [react-router-dom](https://www.npmjs.com/package/react-router-dom): 
      - React-Router-Dom wird verwendet, um die Navigation zwischen den Seiten zu ermöglichen.

  - Standard Libraries
    - Die folgenden Libraries wurden automatisch beim Setup (Vite und Typescript) importiert:
      - [react](https://www.npmjs.com/package/react)
      - [react-dom](https://www.npmjs.com/package/react-dom)
      - [@types/react](https://www.npmjs.com/package/@types/react)
      - [@types/react-dom](https://www.npmjs.com/package/@types/react-dom)
      - [@typescript-eslint/eslint-plugin](https://www.npmjs.com/package/@typescript-eslint/eslint-plugin)
      - [@typescript-eslint/parser](https://www.npmjs.com/package/@typescript-eslint/parser)
      - [@vitejs/plugin-react](https://www.npmjs.com/package/@vitejs/plugin-react)
      - [eslint](https://www.npmjs.com/package/eslint)
      - [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)
      - [eslint-plugin-react-refresh](https://www.npmjs.com/package/esint-plugin-react-refresh)
      - [typescript](https://www.npmjs.com/package/typescript)
      - [vite](https://www.npmjs.com/package/vite)

# 8.3 Schutz gegen XSS-Attacken

React ist von sich aus bereits gegen XSS-Attacken geschützt. Dies ist der Fall, da React die Eingaben der Benutzer automatisch "escaped". Auch haben wir darauf geachtet, in JavaScript immer das innerText-Attribut zu verwenden, anstelle des innerHTML-Attributes. Dies bedeutet, dass die Eingaben der Benutzer nicht als HTML-Code interpretiert werden, sondern als Text. 

# 8.4 Zugangsdaten

For the sake of fulfilling the requirement 8.4, two users will be seeded for testing purposes. These are their login information:

| Role  | Username | Password        |
| ----- | -------- | --------------- |
| Admin | admin    | \#S3$UZe2K2*xjG |
| User  | username | \#S3$UZe2K2*xjG |

As already mentioned, the phone numbers for those users is defined using environment variables that are defined in the [.env-File](./source/server/.env). Make sure to change these accordingly before the seeding happens, in order to receive the 2FA SMS token.
