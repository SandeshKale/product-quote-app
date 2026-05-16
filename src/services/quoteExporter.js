import html2canvas from 'html2canvas';

/**
 * Captures the quote template DOM element as a PNG and shares or downloads it.
 *
 * On iOS/Android: triggers native share sheet with the image file.
 * On desktop (no file share support): falls back to direct download.
 *
 * @param {React.RefObject} templateRef - ref to the offscreen QuoteTemplate div
 * @param {string} quoteNumber - e.g. "QT-1747295834123"
 * @returns {{ method: 'share'|'download', success: boolean, aborted?: boolean }}
 */
export async function exportAndShare(templateRef, quoteNumber) {
  // Render the off-screen element to canvas at 2× resolution
  const canvas = await html2canvas(templateRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));

  const fileName = `${quoteNumber}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  // Try native share (iOS / Android / some desktop browsers)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: quoteNumber,
        files: [file],
      });
      return { method: 'share', success: true };
    } catch (err) {
      if (err.name === 'AbortError') {
        // User dismissed the share sheet — not an error
        return { method: 'share', success: false, aborted: true };
      }
      // Any other share error falls through to download
    }
  }

  // Desktop fallback: trigger browser download
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  return { method: 'download', success: true };
}
