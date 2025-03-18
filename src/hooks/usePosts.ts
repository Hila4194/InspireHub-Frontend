import { useEffect, useState } from "react";
import apiClient, { CanceledError } from "../services/api-client";
import { useAuth } from "../context/AuthContext";

export interface Post {
  _id: string;
  title: string;
  content: string;
  sender: string;
  likes: number;
  comments: { _id: string; content: string; sender: string }[];
}

// This hook fetches posts from the API and manages the state of posts, error, and loading status
const usePosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        const response = await apiClient.get<Post[]>(`/posts/sender/${user._id}`, {
          signal: controller.signal,
          headers: { Authorization: `JWT ${user.accessToken}` },
        });
        setPosts(response.data);
      } catch (error) {
        if (!(error instanceof CanceledError)) {
          setError("Failed to fetch posts.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, [user]);

  return { posts, setPosts, error, isLoading };
};

export default usePosts;