import { FC } from "react";
import usePosts from "../hooks/usePosts";

const PostsList: FC = () => {
    const { posts, isLoading, error } = usePosts();

    return (
        <div className="container mt-4">
            <h2 className="text-center">Posts List</h2>

            {isLoading && <p className="text-center text-primary">Loading...</p>}
            {error && <p className="text-center text-danger">{error}</p>}

            <div className="list-group">
                {posts.map((post) => (
                    <div key={post._id} className="list-group-item">
                        <h5 className="mb-1">{post.title}</h5>
                        <p className="mb-1">{post.content}</p>
                        <small className="text-muted">By User: {post.sender}</small>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PostsList;