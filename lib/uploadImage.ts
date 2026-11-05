// export async function uploadGambarKeCloudinary(base64: string): Promise<string> {
//   const formData = new FormData();
//   formData.append("file", base64);
//   formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || "");

//   const res = await fetch(
//     `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//     { method: "POST", body: formData }
//   );

//   if (!res.ok) throw new Error("Upload gambar ke Cloudinary gagal");
//   const data = await res.json();
//   if (!data.secure_url) throw new Error("URL gambar tidak ditemukan");
//   return data.secure_url as string;
// }
export async function uploadGambarKeCloudinary(file: File | string): Promise<string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  let fileObj: File;

  if (typeof file === "string") {
    // base64 atau blob URL → convert ke File
    const res = await fetch(file);
    const blob = await res.blob();
    fileObj = new File([blob], "image.jpg", { type: blob.type });
  } else {
    fileObj = file;
  }

  const formData = new FormData();
  formData.append("file", fileObj);

  const uploadUrl = `${process.env.NEXT_PUBLIC_API_URL}/upload/image`;

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let errMsg = `Gagal mengupload gambar (status ${res.status})`;
    try { const err = await res.json(); errMsg = err.message || errMsg; } catch (_) {}
    throw new Error(errMsg);
  }

  const data = await res.json();
  if (!data.url) throw new Error("Response tidak mengandung URL gambar");
  return data.url as string;
}