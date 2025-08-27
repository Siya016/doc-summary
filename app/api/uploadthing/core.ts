import { currentUser } from "@clerk/nextjs/server";
import { UploadThingError } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "32MB" } })
    .middleware(async ({ req }) => {
      //get user info
      const user = await currentUser();

      if (!user) {
        throw new UploadThingError("Unauthorized");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload completed for user id", metadata.userId);
      console.log("File name:", file.name);
      console.log("File size:", file.size);
      console.log("File URL (url):", file.url);
      console.log("File URL (ufsUrl):", file.ufsUrl);
      console.log("File URL (serverUrl):", (file as any).serverUrl);
      
      // Try to use the most reliable URL
      const fileUrl = file.url || file.ufsUrl || (file as any).serverUrl;
      
      return {
        userId: metadata.userId,
        fileUrl: fileUrl,
        fileName: file.name,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
