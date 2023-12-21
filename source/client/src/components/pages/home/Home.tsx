import { css } from "@emotion/css";
import { FC, useEffect, useState } from "react";

export const Home: FC = () => {
  const [publicPosts, setPublicPosts] = useState<any>();

  useEffect(() => {
    fetch("/api/post", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          setPublicPosts(data);
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
      `}>Home</h1>

      <div>
        {publicPosts?.map((post: any) =>
            <div key={post.id} onClick={() => window.location.href = "/post/" + post.id} className={css`
                border-bottom: 1px solid white;
                display: flex;
                align-items: center;
                height: 60px;
                padding: 0 10px;
                justify-content: space-between;
        
                & > * {
                  margin: 0 30px 0 0;
                }
                & > *:last-child {
                  margin-right: 0;
                }
                &:hover {
                  cursor: pointer;
                  background-color: #333;
                }
              `}>
              <h2>{post.title}</h2>
              <p>{post.user?.username}</p>
            </div>
          )
        }
      </div>

    </div>
  );
};
