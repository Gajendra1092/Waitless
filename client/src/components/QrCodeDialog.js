import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Snackbar,
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

const QrCodeDialog = ({ open, onClose, queueName, joinUrl }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopySuccess(true);
    });
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };
  
  const downloadQR = () => {
      const svg = document.getElementById("qr-code-svg");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // to scale the image
      const scale = 4;
      canvas.width = svg.width.baseVal.value * scale;
      canvas.height = svg.height.baseVal.value * scale;
      
      const data = new XMLSerializer().serializeToString(svg);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `${queueName}-waitless-qr.png`;
        a.click();
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          {queueName} Join QR Code
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <QRCodeSVG id="qr-code-svg" value={joinUrl} size={220} level="H" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, wordBreak: 'break-all' }}>
              {joinUrl}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy} startIcon={<ContentCopyIcon />}>
            {copySuccess ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button onClick={downloadQR} variant="contained" startIcon={<DownloadIcon />}>
            Download
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Link copied to clipboard"
      />
    </>
  );
};

export default QrCodeDialog;
