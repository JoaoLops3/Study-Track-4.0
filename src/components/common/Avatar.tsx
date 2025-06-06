import { User } from "lucide-react";
import { useEffect, useState } from "react";

interface AvatarProps {
  src: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Cache para armazenar URLs que falharam
const failedUrls = new Set<string>();

// Função para obter a URL do proxy
const getProxyUrl = (url: string) => {
  if (!url) return null;
  if (url.includes("googleusercontent.com")) {
    return `${
      import.meta.env.VITE_SUPABASE_URL
    }/functions/v1/proxy-avatar?url=${encodeURIComponent(url)}`;
  }
  return url;
};

export default function Avatar({
  src,
  alt,
  size = "md",
  className = "",
}: AvatarProps) {
  const [error, setError] = useState(false);
  const [proxySrc, setProxySrc] = useState<string | null>(null);

  useEffect(() => {
    if (src && !failedUrls.has(src)) {
      setError(false);
      setProxySrc(getProxyUrl(src));
    } else {
      setError(true);
      setProxySrc(null);
    }
  }, [src]);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const handleError = () => {
    if (src) {
      failedUrls.add(src);
    }
    setError(true);
    setProxySrc(null);
  };

  if (error || !proxySrc) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
      >
        <User
          className={`${
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6"
          } text-gray-500 dark:text-gray-400`}
        />
      </div>
    );
  }

  return (
    <img
      src={proxySrc}
      alt={alt}
      onError={handleError}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      loading="lazy"
    />
  );
}
