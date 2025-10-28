'use client';
import DownloadSvg from '@/public/assets/icons/DownloadSvg'
import React, { useState, useCallback, useRef, useEffect } from 'react';

interface CardDownloadButtonProps {
  imageUrl: string;
  downloadFormat?: 'png' | 'jpg' | 'jpeg';
  className?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: (success: boolean) => void;
  onError?: (error: Error) => void;
}


const CardDownloadButton: React.FC<CardDownloadButtonProps> = ({
  imageUrl,
  downloadFormat = 'png',
  className = '',
  onDownloadStart,
  onDownloadComplete,
  onError
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  
  const abortControllerRef = useRef<AbortController | null>(null);

 
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);


  
  const isConvertibleImage = useCallback((blob: Blob): boolean => {
    return ['image/webp', 'image/png', 'image/jpeg'].includes(blob.type);
  }, []);

  
  const convertImageFormat = useCallback((
    imageBlob: Blob, 
    format: 'png' | 'jpg', 
    quality: number = 1
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Canvas conversion not available in SSR'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      const cleanup = () => {
        URL.revokeObjectURL(img.src);
      };

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          

          ctx.drawImage(img, 0, 0);
          

          const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
          
          canvas.toBlob((blob) => {
            cleanup();
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert image'));
            }
          }, mimeType, quality);
        } catch (error) {
          cleanup();
          reject(error);
        }
      };

      img.onerror = () => {
        cleanup();
        reject(new Error('Failed to load image for conversion'));
      };
      
      img.src = URL.createObjectURL(imageBlob);
    });
  }, []);

  
  const getFileExtension = useCallback((contentType: string, url: string): string => {
    const contentTypeLower = contentType.toLowerCase();
    
    
    if (contentTypeLower.includes('gif')) return 'gif';
    if (contentTypeLower.includes('mp4')) return 'mp4';
    if (contentTypeLower.includes('webm')) return 'webm';
    if (contentTypeLower.includes('quicktime') || contentTypeLower.includes('mov')) return 'mov';
    if (contentTypeLower.includes('x-msvideo') || contentTypeLower.includes('avi')) return 'avi';
    if (contentTypeLower.includes('x-ms-wmv') || contentTypeLower.includes('wmv')) return 'wmv';
    if (contentTypeLower.includes('3gpp') || contentTypeLower.includes('3gp')) return '3gp';
    if (contentTypeLower.includes('x-flv') || contentTypeLower.includes('flv')) return 'flv';
    if (contentTypeLower.includes('x-matroska') || contentTypeLower.includes('mkv')) return 'mkv';
    if (contentTypeLower.includes('ogg') || contentTypeLower.includes('ogv')) return 'ogv';
    if (contentTypeLower.includes('mp2t') || contentTypeLower.includes('ts')) return 'ts';

    
    if (contentTypeLower.includes('video')) {
      const urlExtension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
      const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'wmv', '3gp', 'flv', 'mkv', 'ogv', 'ts', 'm4v'];
      return (urlExtension && videoExtensions.includes(urlExtension)) ? urlExtension : 'mp4';
    }

   
    if (contentTypeLower.includes('image')) {
      const urlExtension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
      const imageExtensions = ['webp', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'svg'];
      return (urlExtension && imageExtensions.includes(urlExtension)) ? urlExtension : 'png';
    }

    
    const urlExtension = url.split('.').pop()?.split('?')[0]?.toLowerCase();
    return urlExtension || 'file';
  }, []);

  
  const handleDownload = useCallback(async (format: 'png' | 'jpg' | 'jpeg' = downloadFormat) => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setProgress(0);
      onDownloadStart?.();

      abortControllerRef.current = new AbortController();


      const response = await fetch(imageUrl, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;


      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        if (value) {
            chunks.push(value);
            received += value.length;
        }
        
        if (total > 0) {
          const percentCompleted = Math.round((received * 100) / total);
          setProgress(percentCompleted);
        }
      }

      const blob = new Blob(chunks as BlobPart[]);
      const contentType = response.headers.get('content-type') || '';
      
      setProgress(100);


      let finalBlob: Blob;
      let fileExtension: string;

      const isImage = isConvertibleImage(blob);
      
      if (isImage && (format === 'png' || format === 'jpg')) {

        finalBlob = await convertImageFormat(blob, format);
        fileExtension = format;
      } else {
        finalBlob = blob;
        fileExtension = getFileExtension(contentType, imageUrl);
      }
      

      if (typeof window !== 'undefined') {
        const downloadUrl = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `downloaded-media.${fileExtension}`;
        
      
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 100);
      }

      onDownloadComplete?.(true);
      

      setTimeout(() => {
        setIsDownloading(false);
        setProgress(0);
      }, 500);

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('Error downloading media:', errorObj);
      onError?.(errorObj);
      onDownloadComplete?.(false);
      setIsDownloading(false);
      setProgress(0);
    }
  }, [downloadFormat, imageUrl, isDownloading, isConvertibleImage, convertImageFormat, getFileExtension, onDownloadStart, onDownloadComplete, onError]);


  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={() => handleDownload()}
          disabled={isDownloading}
          className={`relative flex items-center text-[10px] rounded-full justify-center w-7 h-7 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
            isDownloading 
              ? "bg-blue-400 border-2 border-blue-500" 
              : ""
          }`}
          aria-label={isDownloading ? `Downloading ${progress}%` : "Download media"}
        >
          {isDownloading ? (
            <div className="flex items-center justify-center">
              <span className="text-white font-bold text-[8px]">{progress}%</span>
              <div 
                className="absolute inset-0 rounded-full border-2 border-transparent"
                style={{
                  background: `conic-gradient(#3b82f6 ${progress * 3.6}deg, transparent 0deg)`,
                  WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
                  mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))'
                }}
              />
            </div>
          ) : (
            <DownloadSvg/>
          )}
        </button>
      </div>

    </>
  );
};

export default CardDownloadButton;

