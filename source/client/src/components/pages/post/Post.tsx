import { css } from "@emotion/css";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Post: FC = () => {
  const [post, setPost] = useState({} as any);
  const [loggedIn, setLoggedIn] = useState(false);
  const params = useParams();

  const comment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInputs = Object.fromEntries(new FormData(event.currentTarget));
    userInputs.postId = post.id;
    fetch("/api/post/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        userInputs
      ),
    }).then((response) => {
      if (response.status === 200) {
        window.location.reload();
      }
    });
  }

  useEffect(() => {
    fetch(`/api/post/${params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          setPost(data);
        });
      } else {
        window.location.href = "/";
      }
    });
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

  return (
    <div className={css`
      width: 50%;
      margin: 0 auto;
      margin-bottom: 200px;
    `}>
      <h1 className={css`
        margin: 100px 0 50px;
        text-align: center;
      `}>{post.title}</h1>

      <p>Author: {post.user?.username}</p>
      <hr />
      <p className={css`
        margin: 100px 0;
      `}>{post.content}</p>
      <hr />
      <h2>Comments:</h2>
      <ul>
        {post.comments?.map((comment: any) =>
          <li key={comment.id} className={css`
            margin-bottom: 10px;
            white-space: pre-wrap;
          `}>{comment.user?.username}:<br />{comment.content}</li>
        )}
      </ul>

      {loggedIn && (
        <form onSubmit={comment} className={css`
        margin-top: 50px;
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
          <textarea name="content" placeholder="Comment" cols={50} rows={5} maxLength={200}></textarea>
          <input type="submit" value="Comment" />
        </form>
      )}
    </div>
  );
};
