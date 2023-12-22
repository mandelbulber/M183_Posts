import { css } from "@emotion/css";
import { FC, useEffect } from "react";

export const TwoFactor: FC = () => {
  useEffect(() => {
    fetch("/api/auth/isAuthenticated", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        if (data) {
          window.location.href = "/dashboard";
        }
      });
    });
  }, []);

  const sumbitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/api/auth/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        smsToken: Object.fromEntries(new FormData(event.currentTarget)).code,
        username: localStorage.getItem("username"),
      }),
    }).then((response) => {
      if (response.status === 200) {
        localStorage.removeItem("username");
        window.location.href = "/dashboard";
      } else if (response.status === 403) {
        window.location.href = "/login";
      } else {
        document.getElementById("server_message")!.innerHTML =
          response.statusText;
      }
    });
  };

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
      <h1>Verify your identity</h1>
      <p>Enter your sms code</p>

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
        <input type="text" name="code" placeholder="Code" />
        <input type="submit" value="Verify" />
      </form>
    </div>
  );
};
