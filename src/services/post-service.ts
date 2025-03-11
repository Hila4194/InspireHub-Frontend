import apiClient from "./api-client";

export interface PostData {
    title: string;
    content?: string;
    image?: File;
    token: string;
}

export const createPost = async (postData: PostData) => {
    try {
        let imageUrl = "";

        // ✅ Upload Image First (if applicable)
        if (postData.image) {
            const formData = new FormData();
            formData.append("file", postData.image);

            const uploadResponse = await apiClient.post("/uploads/post-image", formData, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${postData.token}`,
                },
            });

            imageUrl = `/uploads/${uploadResponse.data.url.split("/").pop()}`; // ✅ Ensured correct storage path
        }

        // ✅ Send Post Data with Image URL
        const response = await apiClient.post("/posts", {
            title: postData.title,
            content: postData.content || "",
            imageUrl,
        }, {
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${postData.token}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("❌ Error creating post:", error);
        throw error;
    }
};

export const fetchUserPosts = async (userId: string) => {
    try {
      const response = await apiClient.get(`/posts/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching user posts:", error);
      return [];
    }
  };

  export const updatePost = async (postId: string, updatedData: FormData | Partial<PostData>) => {
    try {
        const headers = updatedData instanceof FormData 
            ? { "Content-Type": "multipart/form-data" } 
            : { "Content-Type": "application/json" };

        console.log("📌 Sending Update Request:", updatedData);

        const response = await apiClient.put(`/posts/${postId}`, updatedData, { headers });
        return response.data;
    } catch (error) {
        console.error("❌ Error updating post:", error);
        throw error;
    }
};

export const deletePost = async (postId: string) => {
    try {
        const response = await apiClient.delete(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        console.error("❌ Error deleting post:", error);
        throw error;
    }
};