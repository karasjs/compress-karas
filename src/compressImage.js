function compressImage (imageConfig) {
  return new Promise(resolve => {
    const {
      width,
      height,
      quality,
      src,
    } = imageConfig;
    const image = new Image();
    image.onload = () => {
      resolve({
        image,
        width,
        height,
        mimeType: base64MimeType(src),
        quality,
      });
    };
    if (window.navigator && /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(window.navigator.userAgent)) {
      // Fix the `The operation is insecure` error (#57)
      image.crossOrigin = 'anonymous';
    }
    image.src = src;
  }).then(drawCanvas);
}

function drawCanvas(config) {
  return new Promise(resolve => {
    const { image, width, height, mimeType, quality } = config;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    context.fillStyle = 'transparent';
    context.fillRect(0, 0, width, height);
    context.save();
    context.drawImage(image, 0, 0, width, height);
    context.restore();
    if (canvas.toBlob) {
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
          resolve(reader.result);
        }
      }, mimeType, quality);
    }
  });
}

function base64MimeType(encoded) {
  let result = null;
  if (typeof encoded !== 'string') {
    return result;
  }
  let mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length) {
    result = mime[1];
  }
  return result;
}

export default compressImage;
