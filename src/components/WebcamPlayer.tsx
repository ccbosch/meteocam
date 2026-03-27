import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import { WebcamSource } from '@/types';
import { WebcamService } from '@/services/WebcamService';
import { useWebcam } from '@/hooks/useWebcam';
import { useAppStore } from '@/stores/appStore';
import { useI18n } from '@/hooks/useI18n';

interface WebcamPlayerProps {
  webcam: WebcamSource;
  className?: string;
  style?: React.CSSProperties;
}

// ─── Image player (existing poll-based behaviour) ──────────────────────────
const ImagePlayer: React.FC<{ webcam: WebcamSource; className?: string; style?: React.CSSProperties }> = ({
  webcam,
  className,
  style,
}) => {
  const { settings } = useAppStore();
  const { t } = useI18n();
  const { imageUrl, isLoading, error } = useWebcam(
    webcam.url,
    webcam.refreshInterval || settings.defaultRefreshInterval
  );

  if (isLoading && !imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error && !imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{t('location.webcamUnavailable')}</p>
        </div>
      </div>
    );
  }

  if (!imageUrl) return null;

  return (
    <img
      src={imageUrl}
      alt="Webcam"
      className={className}
      style={style}
    />
  );
};

// ─── MJPEG player (native browser multipart stream) ────────────────────────
const MjpegPlayer: React.FC<{ webcam: WebcamSource; className?: string; style?: React.CSSProperties }> = ({
  webcam,
  className,
  style,
}) => {
  const { t } = useI18n();
  const [errored, setErrored] = React.useState(false);

  if (errored) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{t('location.webcamUnavailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={webcam.url}
      alt="Webcam stream"
      className={className}
      style={style}
      onError={() => setErrored(true)}
    />
  );
};

// ─── HLS player ────────────────────────────────────────────────────────────
const HlsPlayer: React.FC<{ webcam: WebcamSource; className?: string; style?: React.CSSProperties }> = ({
  webcam,
  className,
  style,
}) => {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = React.useState(false);

  useEffect(() => {
    if (!videoRef.current || !webcam.url) return;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(webcam.url);
      hls.attachMedia(videoRef.current);
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) setError(true);
      });
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari native
      videoRef.current.src = webcam.url;
    } else {
      setError(true);
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [webcam.url]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{t('location.webcamUnavailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      style={style}
      autoPlay
      muted
      playsInline
      onError={() => setError(true)}
    />
  );
};

// ─── MP4 / WebM player ─────────────────────────────────────────────────────
const Mp4Player: React.FC<{ webcam: WebcamSource; className?: string; style?: React.CSSProperties }> = ({
  webcam,
  className,
  style,
}) => {
  const { t } = useI18n();
  const [error, setError] = React.useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center p-4">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-500">{t('location.webcamUnavailable')}</p>
        </div>
      </div>
    );
  }

  return (
    <video
      src={webcam.url}
      className={className}
      style={style}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setError(true)}
    />
  );
};

// ─── Embed / iframe player ────────────────────────────────────────────────
const EmbedPlayer: React.FC<{ webcam: WebcamSource }> = ({ webcam }) => {
  const { t } = useI18n();
  return (
    <div className="absolute inset-0">
      <iframe
        src={webcam.url}
        title={webcam.name || 'Webcam'}
        className="w-full h-full border-0"
        allow="autoplay; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms"
        onError={() => {}}
      />
      <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded pointer-events-none">
        {t('location.embeddedView')}
      </div>
    </div>
  );
};

// ─── Main WebcamPlayer ──────────────────────────────────────────────────────
const WebcamPlayer: React.FC<WebcamPlayerProps> = ({ webcam, className, style }) => {
  const resolvedType = webcam.type || WebcamService.detectType(webcam.url);

  switch (resolvedType) {
    case 'mjpeg':
      return <MjpegPlayer webcam={webcam} className={className} style={style} />;
    case 'hls':
      return <HlsPlayer webcam={webcam} className={className} style={style} />;
    case 'mp4':
      return <Mp4Player webcam={webcam} className={className} style={style} />;
    case 'embed':
      return <EmbedPlayer webcam={webcam} />;
    default:
      return <ImagePlayer webcam={webcam} className={className} style={style} />;
  }
};

export default WebcamPlayer;
