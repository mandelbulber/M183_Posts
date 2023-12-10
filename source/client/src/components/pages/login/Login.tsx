import { css } from "@emotion/css";
import { FC } from "react";
export const Login: FC = () => {
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget))
      ),
    }).then((response) => {
      if (response.status === 200) {
        window.location.href = "/verify";
      } else {
        document.getElementById("server_message")!.innerHTML = response.statusText;
      }
    });
  };

  return (
    <div className={css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `}>
      <h1>Login</h1>

      <div id="server_message" className={css`
        color: red;
        font-weight: bold;
      `} />

      <form onSubmit={submitForm} className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        input {
          margin-top: 1rem;
          padding: 0.5rem;
          border: none;
          border-radius: 0.5rem;
        }
      `}>
        <input type="text" name="username" placeholder="Username" />
        <input type="password" name="password" placeholder="Password" />
        <input type="submit" value="Login" />
      </form>
      <a href="/register" className={css`
        margin-top: 1rem;
        margin-bottom: 2rem;
        color: grey;
        text-decoration: underline;
      `}>Don't have an account yet?</a>
    </div>
  );
};