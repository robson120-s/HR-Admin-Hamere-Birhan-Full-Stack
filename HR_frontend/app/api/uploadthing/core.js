import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

// This is a fake auth user, replace with your actual user logic if needed
const auth = (req) => ({ id: "fakeId" }); 

export const ourFileRouter = {
  // Define as many FileRoutes as you like
  employeePhotoUploader: f({ image: { maxFileSize: "2MB" } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = auth(req);
      if (!user) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
};