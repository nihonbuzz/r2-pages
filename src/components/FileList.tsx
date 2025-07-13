import { useEffect, useState } from "react";

type FileItem = {
  Key: string;
  Size: number;
  LastModified: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getFileIcon(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) return "fal fa-file-image text-pink-500";
  if (["pdf"].includes(ext)) return "fal fa-file-pdf text-red-600";
  if (["doc", "docx"].includes(ext)) return "fal fa-file-word text-blue-600";
  if (["xls", "xlsx"].includes(ext)) return "fal fa-file-excel text-green-600";
  if (["ppt", "pptx"].includes(ext)) return "fal fa-file-powerpoint text-orange-500";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "fal fa-file-archive text-yellow-600";
  if (["mp4", "mkv", "webm"].includes(ext)) return "fal fa-file-video text-purple-600";
  if (["mp3", "wav", "ogg"].includes(ext)) return "fal fa-file-audio text-indigo-500";
  if (["txt", "md", "json", "xml", "csv"].includes(ext)) return "fal fa-file-alt text-gray-500";
  return "fal fa-file text-gray-400";
}

export default function FileList() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState("");
  const cdnUrl = import.meta.env.VITE_CDN_URL;

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch files:", err);
        setLoading(false);
      });
  }, []);

  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];
  const filtered = files.filter((file) => file.Key.startsWith(currentPath));
  const displayItems: {
    type: "folder" | "file";
    name: string;
    fullPath: string;
    item?: FileItem;
  }[] = [];

  const seen = new Set<string>();

  for (const file of filtered) {
    const rest = file.Key.slice(currentPath.length);
    const [nextSegment, ...remaining] = rest.split("/");
    if (!nextSegment || seen.has(nextSegment)) continue;
    seen.add(nextSegment);

    if (remaining.length > 0) {
      displayItems.push({
        type: "folder",
        name: nextSegment,
        fullPath: currentPath + nextSegment + "/",
      });
    } else {
      displayItems.push({
        type: "file",
        name: nextSegment,
        fullPath: file.Key,
        item: file,
      });
    }
  }

  if (loading) {
    return <p className="p-6 text-gray-500">Loading files...</p>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="py-3 flex justify-center bg-slate-900">
        <img
            src="https://support.nihonbuzz.org/assets/Company/NihonBuzz-Logo-Landscape-Dark.png"
            alt="NihonBuzz Logo"
            className="h-12 object-contain"
        />
      </header>

      {/* Main content */}
      <main className="flex-1 w-[95%] md:w-[90%] lg:w-[80%] mx-auto p-6">
        {/* Breadcrumb */}
        <div className="text-sm mb-4 text-gray-600">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => setCurrentPath("")}
          >
            <i className="fal fa-home mr-1" />
            Home
          </span>
          {pathSegments.map((seg, idx) => {
            const pathUpTo = pathSegments.slice(0, idx + 1).join("/") + "/";
            return (
              <span key={idx}>
                {" / "}
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => setCurrentPath(pathUpTo)}
                >
                  {seg}
                </span>
              </span>
            );
          })}
        </div>

        <table className="w-[95%] md:w-[90%] lg:w-[100%] text-sm text-left border shadow rounded overflow-hidden mx-auto">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2">Ukuran</th>
              <th className="px-4 py-2">Diunggah</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.map((entry) => (
              <tr
                key={entry.fullPath}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  entry.type === "folder"
                    ? setCurrentPath(entry.fullPath)
                    : undefined
                }
              >
                <td className="px-4 py-2 flex items-center gap-2">
                  {entry.type === "folder" ? (
                    <>
                      <i className="fal fa-folder text-yellow-500" />
                      <span className="font-medium text-yellow-700">{entry.name}</span>
                    </>
                  ) : (
                    <>
                      <i className={getFileIcon(entry.name)} />
                      <a
                        href={`${cdnUrl}/${entry.fullPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {entry.name}
                      </a>
                    </>
                  )}
                </td>
                <td className="px-4 py-2">
                  {entry.type === "file" ? formatSize(entry.item!.Size) : "--"}
                </td>
                <td className="px-4 py-2">
                  {entry.type === "file"
                    ? formatDate(entry.item!.LastModified)
                    : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 text-gray-500 text-sm py-4 text-center mt-auto shadow-inner">
        Dibuat dengan ❤️ menggunakan Cloudflare R2, React, dan TailwindCSS
      </footer>
    </div>
  );
}
