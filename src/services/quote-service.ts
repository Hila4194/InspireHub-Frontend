import apiClient from "./api-client";

export interface Quote {
    q: string; // Quote text
    a: string; // Author
}

export const fetchMotivationalQuote = async (): Promise<Quote | null> => {
    try {
        // ✅ Fetch from backend instead of ZenQuotes API directly
        const response = await apiClient.get<Quote[]>("/quote");
        return response.data[0]; // ✅ Get the first quote from response
    } catch (error) {
        console.error("❌ Error fetching motivational quote:", error);
        return null;
    }
};