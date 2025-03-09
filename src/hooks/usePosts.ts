import { useEffect, useState } from "react";
import apiClient, { CanceledError } from "../services/api-client"; // ✅ Use apiClient

// Define the Post type
export interface Post {
    _id: string;
    title: string;
    content: string;
    sender: string;
}

// Custom Hook for Fetching Posts
const usePosts = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const controller = new AbortController(); // ✅ To cancel API request if needed

        const fetchPosts = async () => {
            try {
                const response = await apiClient.get<Post[]>("/posts", {
                    signal: controller.signal, // ✅ Add request cancelation support
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

        return () => controller.abort(); // ✅ Cleanup function to cancel request on unmount
    }, []);

    return { posts, setPosts, error, isLoading };
};

export default usePosts;