import { css } from "@emotion/css";
import { FC, useEffect, useState } from "react";
import { redirect } from "react-router-dom";

export const Navigation: FC = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/isAuthenticated", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        setLoggedIn(data);
      });
    });
  }, []);

  const logout = () => {
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        setLoggedIn(false);
        window.location.href = "/";
      }      
    });
  };

  return (
    <div
      className={css`
        background-color: #333;
        color: #fff;
        box-shadow: 0px 0px 14px 0px rgb(88 252 255 / 64%);
        padding-inline: 10rem;

        display: flex;
        align-items: center;
        justify-content: space-between;
      `}
    >
      <a
        href="/"
        className={css`
          text-decoration: none;
          color: #fff;
        `}
      >
        <h1>Posts App or somethin</h1>
      </a>
      <div
        className={css`
          display: flex;
          align-items: center;
          justify-content: space-between;

          a {
            margin-left: 1rem;
            color: #fff;
            text-decoration: none;
            border: none;
            background-color: transparent;
            cursor: pointer;
          }
        `}
      >
        {(loggedIn && (
          <>
            <a href="/dashboard">
              <h2>Dashboard</h2>
            </a>
            <a onClick={logout}>
              <h2>Logout</h2>
            </a>
            <a href="/profile">
              <h2>Profile</h2>
            </a>
          </>
        )) || (
          <>
            <a href="/login">
              <h2>Login</h2>
            </a>
            <a href="/register">
              <h2>Register</h2>
            </a>
          </>
        )}
      </div>
    </div>
  );
};
