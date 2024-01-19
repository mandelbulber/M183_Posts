import { css } from "@emotion/css";
import { FC, useEffect, useRef, useState } from "react";

export const Profile: FC = () => {
  const [user, setUser] = useState({} as any);
  const [phoneNumber, setPhoneNumber] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);

  const requestPhoneNumberUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInputs = Object.fromEntries(new FormData(event.currentTarget));
    fetch("/api/auth/requestPhoneNumberUpdate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputs),
    }).then((response) => {
      if (response.status === 201) {
        dialog.current?.showModal();
      }
    });
  }

  const verifyPhoneNumberUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInputs = Object.fromEntries(new FormData(event.currentTarget));
    fetch("/api/auth/verifyPhoneNumberUpdate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputs),
    }).then((response) => {
      if (response.status === 201) {
        window.location.reload();
      } else {
        document.getElementById("server_message")!.innerText = "Invalid SMS Code";
      }
    });
  }

  useEffect(() => {
    fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          setUser(data);
          setPhoneNumber(data.phoneNumber);
        });
      } else {
        window.location.href = "/login";
      }
    });
  }, []);

  return (
    <div
      className={css`
        width: 50%;
        margin: 0 auto;
        margin-bottom: 200px;
      `}
    >
      <h1
        className={css`
        margin: 100px 0 50px;
        text-align: center;
      `}
      >
        Profile
      </h1>
      <p>Username: {user.username}</p>
      <p>E-Mail: {user.email}</p>
      <p>
        Phone Number:
        <form onSubmit={requestPhoneNumberUpdate} className={css`
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            & > * {
              margin-bottom: 20px;
            }
            & > *:last-child {
              margin-bottom: 0;
            }
          `}>
          <input type="text" name="phoneNumber" id="phoneNumber" defaultValue={user.phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} />
          <input type="submit" value="Update Phone Number" />
        </form>
      </p>
      <dialog
        ref={dialog}
        className={css`
          ::backdrop {
            background-color: black;
            opacity: 0.8;
          }
          background-color: #1e1e1e;
          border: 1px solid white;
          color: white;
          padding: 3em 3em;
        `}>
        <h2 className={css`
          margin-top: 0;
        `}>SMS Validation</h2>
        <p>A code has been sent to {phoneNumber}. To change your phone number, please submit your received code.</p>
        <form onSubmit={verifyPhoneNumberUpdate} className={css`
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            & > * {
              margin-bottom: 20px;
            }
            & > *:last-child {
              margin-bottom: 0;
            }
          `}>
          <input type="text" name="smsToken" id="smsToken" placeholder="SMS Code" />
          <input type="submit" value="Update Phone Number" />
          <span id="server_message" className={css`
          color: red;
          font-weight: bold;`}></span>
        </form>
      </dialog>
    </div>
  );
};
