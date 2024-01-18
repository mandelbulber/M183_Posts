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

# 8.3 Schutz gegen XSS-Attacken

# 8.4 Zugangsdaten

For the sake of fulfilling the requirement 8.4, two users will be seeded for testing purposes. These are their login information:

| Role  | Username | Password        |
| ----- | -------- | --------------- |
| Admin | admin    | \#S3$UZe2K2*xjG |
| User  | username | \#S3$UZe2K2*xjG |

As already mentioned, the phone numbers for those users is defined using environment variables that are defined in the [.env-File](./source/server/.env). Make sure to change these accordingly before the seeding happens, in order to receive the 2FA SMS token.
