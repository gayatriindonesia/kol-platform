import React from 'react';
import { X } from 'lucide-react';

interface VideoModalProps {
  selectedVideo: string | null;
  closeVideo: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoModal: React.FC<VideoModalProps> = ({ selectedVideo, closeVideo, videoRef }) => {
  if (!selectedVideo) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl">
        <button
          onClick={closeVideo}
          className="absolute -top-12 right-0 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
            title="YouTube video player"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default VideoModal;