import { css } from "@emotion/css";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Post: FC = () => {
  const [post, setPost] = useState({} as any);
  const params = useParams();
  
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
      }
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

      <p>Author: {post.userId}</p>
      <hr />
      <p>{post.content}</p>

    </div>
  );
};
