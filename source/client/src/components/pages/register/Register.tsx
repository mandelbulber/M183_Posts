import { FC } from "react";
import { css } from "@emotion/css";

// [req 2.1] [req 2.2]
export const Register: FC = () => {
  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        Object.fromEntries(new FormData(event.currentTarget))
      ),
    }).then((response) => {
      if (response.status === 201) {
        window.location.href = "/";
      } else {
        document.getElementById("server_message")!.innerHTML = response.statusText;
      }
    });
  };

  const checkInput = () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const emailValid = email !== "" && email!.includes("@") && email!.includes(".");
    const usernameValid = (document.getElementById("username") as HTMLInputElement).value != "";
    const passwordValid = checkPassword((document.getElementById("password") as HTMLInputElement).value);

    if (emailValid && usernameValid && passwordValid) {
      document.getElementById("submit")!.removeAttribute("disabled");
    } else {
      document.getElementById("submit")!.setAttribute("disabled", "true");
    }
  }
  
  const checkPassword= (password: string) => {
    // check if password meets requirements
    let lengthMet = password.length >= 12;
    let uppercaseMet = /[A-Z]/.test(password);
    let lowercaseMet = /[a-z]/.test(password);
    let numberMet = /[0-9]/.test(password);
    let specialMet = /[!@#$%^&*]/.test(password);

    // hide met requirements
    if (lengthMet)
      document.getElementById("pw_req_length")!.hidden = true;
    else
      document.getElementById("pw_req_length")!.hidden = false;
    if (uppercaseMet)
      document.getElementById("pw_req_uppercase")!.hidden = true;
    else
      document.getElementById("pw_req_uppercase")!.hidden = false;
    if (lowercaseMet)
      document.getElementById("pw_req_lowercase")!.hidden = true;
    else
      document.getElementById("pw_req_lowercase")!.hidden = false;
    if (numberMet)
      document.getElementById("pw_req_number")!.hidden = true;
    else
      document.getElementById("pw_req_number")!.hidden = false;
    if (specialMet)
      document.getElementById("pw_req_special")!.hidden = true;
    else
      document.getElementById("pw_req_special")!.hidden = false;

    // if password meets requirements, enable submit button
    if (lengthMet && uppercaseMet && lowercaseMet && numberMet && specialMet) {
      document.getElementById("pw_req_title")!.hidden = true;
      return true;
    } else {
      document.getElementById("pw_req_title")!.hidden = false;
      return false;
    }
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
      <h1>Register</h1>
      
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
        <input id="username" type="text" onChange={checkInput} name="username" placeholder="Username" />
        <input id="email" type="email" onChange={checkInput} name="email" placeholder="Email" />
        <input id="password" type="password" onChange={checkInput} name="password" placeholder="Password" />
        <input id="submit" type="submit" value="Register" disabled/>
      </form>

      <h4 id="pw_req_title">Password Requirements</h4>
      <div id="pw_req_length">12 characters</div>
      <div id="pw_req_uppercase">Uppercase letter</div>
      <div id="pw_req_lowercase">Lowercase letter</div>
      <div id="pw_req_number">Number</div>
      <div id="pw_req_special">Special character</div>
    </div>
  );
};
