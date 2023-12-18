import { NextApiRequest, NextApiResponse } from "next";
import supabase from "supabase";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "https://jp.supreme.com"); // Adjust this to match the requesting origin
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "GET") {
        try {
            // Fetch data from the 'stickers' table
            let { data, error } = await supabase.from("stickers").select("*");

            if (error) {
                throw error;
            }

            // Send the data as JSON
            res.status(200).json(data);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        // Handle any other HTTP method
        res.setHeader("Allow", ["GET"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
