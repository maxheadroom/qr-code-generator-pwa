// QR Code Generation Web Worker

// Try to import the required libraries
let librariesLoaded = false;
try {
    self.importScripts('libs/qrcode.min.js', 'libs/qrcode-worker-wrapper.js');
    librariesLoaded = true;
} catch (error) {
    console.error('Failed to load QR code libraries in worker:', error);
}

self.addEventListener('message', (e) => {
    // If libraries failed to load, send error back
    if (!librariesLoaded) {
        self.postMessage({
            success: false,
            error: 'QR code libraries not available in worker'
        });
        return;
    }
    
    const { data, options } = e.data;
    
    try {
        // Generate QR code data using the QRCode library
        const qrData = QRCode.generateQRData(data, {
            width: options.size || 256,
            height: options.size || 256,
            colorDark: options.foreground || '#000000',
            colorLight: options.background || '#FFFFFF',
            correctLevel: QRCode.CorrectLevel[options.errorCorrectionLevel] || QRCode.CorrectLevel.M
        });
        
        // Send result back to main thread
        self.postMessage({
            success: true,
            qrData: qrData,
            options: options
        });
    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            success: false,
            error: error.message
        });
    }
});