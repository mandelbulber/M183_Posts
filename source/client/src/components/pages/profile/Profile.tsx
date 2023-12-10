import { FC, useEffect, useState } from "react";

export const Profile: FC = () => {
  const [user, setUser] = useState({} as any);

  useEffect(() => {
    fetch("/api/auth/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 401) {
        window.location.href = "/login";
      } else {
        response.json().then((data) => {
          setUser(data);
        });
      }
    });
  }, []);

  return (
    <>
      <h1>{user.username}</h1>
      <h1>{user.email}</h1>
      <h1>{user.phoneNumber}</h1>
    </>
  );
};
