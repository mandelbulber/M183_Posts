import { css } from "@emotion/css";
import { FC, useEffect } from "react";
export const Login: FC = () => {
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

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInputs = Object.fromEntries(new FormData(event.currentTarget));
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputs),
    }).then((response) => {
      if (response.status === 200) {
        localStorage.setItem("username", userInputs.username.toString());
        window.location.href = "/verify";
      } else {
        document.getElementById("server_message")!.innerText = response.statusText;
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
      <h1>Login</h1>

      <div
        id="server_message"
        className={css`
          color: red;
          font-weight: bold;
        `}
      />

      <form
        onSubmit={submitForm}
        className={css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          input {
            margin-bottom: 20px;
          }
          input:last-child {
            margin-bottom: 0;
          }
        `}
      >
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <input type="submit" value="Login" />
      </form>
      <a
        href="/register"
        className={css`
          margin-top: 1rem;
          margin-bottom: 2rem;
          color: aqua;
        `}
      >
        Don't have an account yet?
      </a>
      <a 
        href="https://github.com/login/oauth/authorize?client_id=37af0dc7e25266b0cbd0"
        className={css`
          margin-bottom: 1rem;
          color: aqua;
        `}
      >
        Login with Github
      </a>
    </div>
  );
};
