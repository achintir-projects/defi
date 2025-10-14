'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode, CheckCircle } from 'lucide-react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  showDownload?: boolean;
  className?: string;
}

export default function QRCodeGenerator({ 
  value, 
  size = 256, 
  title = 'QR Code',
  showDownload = true,
  className = ''
}: QRCodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current || !value) return;

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });
        setQrGenerated(true);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [value, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '-').toLowerCase()}-qr.png`;
    link.href = url;
    link.click();
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* QR Code Canvas */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas 
                ref={canvasRef}
                className="border-2 border-gray-200 rounded-lg shadow-sm"
                style={{ width: size, height: size }}
              />
              {!qrGenerated && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="text-center space-y-2">
                    <QrCode className="h-8 w-8 mx-auto text-gray-400 animate-pulse" />
                    <p className="text-sm text-gray-600">Generating QR Code...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Download Button */}
          {showDownload && qrGenerated && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={downloadQR}
                className="flex items-center gap-2"
              >
                {downloaded ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {downloaded ? 'Downloaded!' : 'Download QR Code'}
              </Button>
            </div>
          )}

          {/* QR Code Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your wallet app
            </p>
            <p className="text-xs text-muted-foreground mt-1 break-all">
              {value.length > 50 ? `${value.substring(0, 50)}...` : value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}