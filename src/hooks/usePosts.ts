import { useEffect, useState } from "react";
import apiClient, { CanceledError } from "../services/api-client";
import { useAuth } from "../context/AuthContext"; // ✅ Import useAuth

export interface Post {
  _id: string;
  title: string;
  content: string;
  sender: string;
}

const usePosts = () => {
  const { user } = useAuth(); // ✅ Get logged-in user
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) return; // ✅ Prevent API call if no user is logged in

    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        const response = await apiClient.get<Post[]>(`/posts/sender/${user._id}`, {
          signal: controller.signal, 
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
  }, [user]); // ✅ Fetch only when user changes

  return { posts, setPosts, error, isLoading };
};

export default usePosts;