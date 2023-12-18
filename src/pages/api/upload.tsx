// pages/api/upload.ts
import { promises as fs } from "fs";

import AWS from "aws-sdk";
import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import supabase from "supabase";

export const config = {
    api: {
        bodyParser: false, // Disables the default Next.js body parser
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // or specify your origin for security
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );

    if (req.method === "POST") {
        const data = await new Promise((resolve, reject) => {
            const form = new IncomingForm({ multiples: false });

            form.parse(req, async (err, fields, files) => {
                if (err) return reject(err);
                const x = fields.x;
                const y = fields.y;
                const link_url = Array.isArray(fields.link_url)
                    ? fields.link_url[0]
                    : fields.link_url;

                const file = files.file[0];
                const filePath = file.filepath; // This is the path to the temporary file
                const fileName = file.originalFilename; // The original file name
                const mimeType = file.mimetype; // The file's mime type

                // Read the file into a buffer
                const fileContent = await fs.readFile(filePath);

                // Now you can pass this buffer to the S3 upload method
                resolve({
                    fields,
                    fileContent,
                    fileName,
                    mimeType,
                    filePath,
                    x,
                    y,
                    link_url,
                });
            });
        });

        const { fileContent, fileName, mimeType, filePath, x, y, link_url } =
            data as any;

        // Configure AWS S3
        const s3 = new AWS.S3();
        const params = {
            Bucket: "jjirasi",
            Key: fileName,
            Body: fileContent,
            ContentType: mimeType,
            ACL: "public-read",
        };
        // Upload to S3
        const uploaded = await s3.upload(params).promise();

        // Clean up the temporary file
        //@ts-ignore
        await fs.unlink(filePath);

        // Add data to Supabase
        const { data: result, error } = await supabase.from("stickers").insert([
            {
                image_url: uploaded.Location,
                position_x: parseInt(x, 10), // Convert x to an integer
                position_y: parseInt(y, 10),
                link_url,
            },
        ]);

        if (error) return res.status(500).json(error);
        return res.status(200).json(result);
    } else {
        return res.status(405).end(); // Method Not Allowed
    }
}
