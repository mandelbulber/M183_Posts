import { css } from "@emotion/css";
import { FC } from "react";

export const Totp: FC = () => {
  const sumbitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/api/auth/totp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totpToken: Object.fromEntries(new FormData(event.currentTarget)).code,
        totpSecret: Object.fromEntries(new FormData(event.currentTarget)).totpSecret,
      }),
    }).then((response) => {
      if (response.status === 200) {
        window.location.href = "/dashboard";
      } else {
        document.getElementById("server_message")!.innerText = response.statusText;
      }
    });
  };

  fetch("/api/auth/totp/setup").then((response) => {
    if (response.status === 200) {
      response.json().then((data) => {
        document.getElementById("QrCode")!.setAttribute("src", data.qr);
        document.getElementsByName("totpSecret")[0].setAttribute("value", data.secret);
      });
    }
  });

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      `}
    >
      <h1>Setup Time-based one-time password</h1>
      <p>Scan QR-Code with an Authentification app: </p>

      <img src="" alt="QrCode" id="QrCode"/>

      <p>Enter your code: </p>
      <form
        onSubmit={sumbitForm}
        className={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          & > * {
            margin-bottom: 20px;
          }
          & > *:last-child {
            margin-bottom: 0;
          }
        `}
      >
        <div
          id="server_message"
          className={css`
            color: red;
            font-weight: bold;
          `}
        />
        <input type="hidden" name="totpSecret" />
        <input type="text" name="code" placeholder="Code" />
        <input type="submit" value="Verify" />
      </form>
    </div>
  );
};
