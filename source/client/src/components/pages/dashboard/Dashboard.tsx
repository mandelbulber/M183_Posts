import { css } from "@emotion/css";
import { FC, useEffect, useRef, useState } from "react";

export const Dashboard: FC = () => {
  const [posts, setPosts] = useState<any>();
  const [isAdmin, setIsAdmin] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  const createPost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userInputs = Object.fromEntries(new FormData(event.currentTarget));
    fetch("/api/post/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputs),
    }).then((response) => {
      if (response.status === 201) {
        loadPosts();
      }
    });
  };

  const deletePost = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setStatus(id, "deleted");
  };

  const sumbitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    fetch("/api/auth/totp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totpToken: Object.fromEntries(new FormData(event.currentTarget)).code,
        postId: Object.fromEntries(new FormData(event.currentTarget)).modaldataId, 
        status: Object.fromEntries(new FormData(event.currentTarget)).modaldataStatus 
      }),
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          fetch("/api/post/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ 
              postId: data.postId, 
              status: data.status 
            }),
          }).then((response) => {
            if (response.status === 200) {
              loadPosts();
            }
          });
        });
        dialog.current?.close();
      } else {
        document.getElementById("server_message")!.innerText = response.statusText;
      }
    });
  };

  const setStatus = (id: string, status: string) => {
    if(status === "published") {
      dialog.current?.querySelector("input[name=modaldataId]")!.setAttribute("value", id);
      dialog.current?.querySelector("input[name=modaldataStatus]")!.setAttribute("value", status);
      dialog.current?.showModal();
    }
    else{
      fetch("/api/post/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: id, status: status }),
      }).then((response) => {
        if (response.status === 200) {
          loadPosts();
        }
      });
    }
  };

  const loadPosts = () => {
    let fetchUrl = "/api/post/";
    if (isAdmin) {
      fetchUrl += "adminPosts";
    } else {
      fetchUrl += "userPosts";
    }
    fetch(fetchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      if (response.status === 200) {
        response.json().then((data) => {
          setPosts(data);
        });
      } else {
        window.location.href = "/login";
      }
    });
  };

  useEffect(() => {
    fetch("/api/auth/isAdmin", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        setIsAdmin(data);
      });
    });
  }, []);

  useEffect(() => {
    loadPosts();
  }, [isAdmin]);

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
        Dashboard{isAdmin && <> (Admin)</>}
      </h1>

      <div>
        {posts?.map((post: any) => (
          <div
            key={post.id}
            className={css`
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
            `}
          >
            <h2>{post.title}</h2>
            <div>
              {(isAdmin && (
                <>
                  {post.user.username}
                  <select
                    value={post.status.name}
                    onChange={(event) =>
                      setStatus(post.id, event.currentTarget.value)
                    }
                    name="status"
                    id="status"
                    style={{
                      borderColor:
                        post.status.name === "published"
                          ? "green"
                          : post.status.name === "hidden"
                          ? "orange"
                          : "red",
                    }}
                    className={css`
                      min-width: 100px;
                      margin-left: 30px;
                      background-color: #1e1e1e;
                      border: 1px solid white;
                      color: white;
                      padding: 8px 8px;
                      border-radius: 10px;

                      &:focus-visible {
                        outline: none;
                      }
                    `}
                  >
                    <option value="deleted">deleted</option>
                    <option value="hidden">hidden</option>
                    {post.status.name !== "deleted" && (
                      <option value="published">published</option>
                    )}
                  </select>
                </>
              )) || (
                <>
                  {post.status.name}
                  <button
                    onClick={() => deletePost(post.id)}
                    className={css`
                      border: none;
                      background-color: transparent;
                      color: aqua;
                      padding: 0;
                      margin-left: 30px;
                      font-size: inherit;
                      font-family: inherit;
                      text-decoration: underline;
                      &:hover {
                        cursor: pointer;
                      }
                    `}
                  >
                    delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        <div>
            {(isAdmin && (
              <>
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
                  `}
                >
                    <h2
                    className={css`
                      margin-top: 0;
                    `}
                    >Enter your totp code: </h2>
                    <form
                      onSubmit={sumbitForm}
                      className={css`
                        
                      `}
                    >
                      <div
                        id="server_message"
                        className={css`
                          color: red;
                          font-weight: bold;
                        `}
                      />
                      <input type="hidden" name="modaldataId" />
                      <input type="hidden" name="modaldataStatus" />
                      <input type="text" name="code" placeholder="Code" />
                      <input 
                        type="submit" 
                        value="Verify" 
                        className={css`
                            margin-left: 5px;
                          `}
                      />
                      <input
                        type="button"
                        value="Cancel"
                        onClick={() => dialog.current?.close()}
                        className={css`
                          margin-left: 5px;
                        `}
                      />
                    </form>
                  </dialog>
              </>
            ))}
        </div>
      </div>
      <div
        className={css`
          margin-top: 100px;
        `}
      >
        <h2>Create new Post</h2>
        <form
          onSubmit={createPost}
          className={css`
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
          `}
        >
          <input name="title" placeholder="Title" />
          <textarea
            name="content"
            placeholder="Content"
            cols={50}
            rows={5}
          ></textarea>
          <input type="submit" value="Post" />
        </form>
      </div>
    </div>
  );
};
