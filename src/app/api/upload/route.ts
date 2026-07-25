import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is configured
cloudinary.config({
  secure: true
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using streams
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "maintenance_app_evidence" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    return NextResponse.json({ url: (uploadResult as any).secure_url });
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    return NextResponse.json({ message: "Failed to upload file" }, { status: 500 });
  }
}
