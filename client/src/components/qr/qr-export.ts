"use client";

import QRCodeStyling from "qr-code-styling";
import { buildQrOptions } from "./qr-render";
import { QRStyleSettings } from "./types";

const EXPORT_SIZE = 1024;
const FRAME_PADDING = 64;
const FRAME_TEXT_HEIGHT = 96;

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function renderRaw(
  settings: QRStyleSettings,
  data: string,
  extension: "png" | "svg"
): Promise<Blob> {
  const qr = new QRCodeStyling({
    ...buildQrOptions(settings, data, EXPORT_SIZE),
    type: extension === "png" ? "canvas" : "svg",
  });
  const raw = await qr.getRawData(extension);
  if (!raw) throw new Error("Failed to render QR code");
  return raw instanceof Blob ? raw : new Blob([new Uint8Array(raw)]);
}

async function composeFramedPng(qrBlob: Blob, settings: QRStyleSettings): Promise<Blob> {
  const frameText = settings.frameText;
  const img = await createImageBitmap(qrBlob);
  const width = EXPORT_SIZE + FRAME_PADDING * 2;
  const height = EXPORT_SIZE + FRAME_PADDING * 2 + (frameText ? FRAME_TEXT_HEIGHT : 0);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = settings.fgColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, width - 4, height - 4 - (frameText ? FRAME_TEXT_HEIGHT : 0));

  ctx.drawImage(img, FRAME_PADDING, FRAME_PADDING, EXPORT_SIZE, EXPORT_SIZE);

  if (frameText) {
    ctx.fillStyle = settings.fgColor;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      frameText.toUpperCase(),
      width / 2,
      EXPORT_SIZE + FRAME_PADDING + FRAME_TEXT_HEIGHT / 2
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("PNG export failed"))), "image/png");
  });
}

async function composeFramedSvg(qrBlob: Blob, settings: QRStyleSettings): Promise<Blob> {
  const innerSvgText = await qrBlob.text();
  const frameText = settings.frameText;
  const width = EXPORT_SIZE + FRAME_PADDING * 2;
  const height = EXPORT_SIZE + FRAME_PADDING * 2 + (frameText ? FRAME_TEXT_HEIGHT : 0);

  const parser = new DOMParser();
  const innerDoc = parser.parseFromString(innerSvgText, "image/svg+xml");
  const innerSvgEl = innerDoc.documentElement;
  innerSvgEl.setAttribute("x", String(FRAME_PADDING));
  innerSvgEl.setAttribute("y", String(FRAME_PADDING));
  innerSvgEl.setAttribute("width", String(EXPORT_SIZE));
  innerSvgEl.setAttribute("height", String(EXPORT_SIZE));

  const textNode = frameText
    ? `<text x="${width / 2}" y="${EXPORT_SIZE + FRAME_PADDING + FRAME_TEXT_HEIGHT / 2}" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-weight="700" font-size="40" fill="${settings.fgColor}" letter-spacing="2">${frameText.toUpperCase()}</text>`
    : "";

  const outerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect x="2" y="2" width="${width - 4}" height="${height - 4 - (frameText ? FRAME_TEXT_HEIGHT : 0)}" fill="${settings.bgColor}" stroke="${settings.fgColor}" stroke-width="4"/>
    ${innerSvgEl.outerHTML}
    ${textNode}
  </svg>`;

  return new Blob([outerSvg], { type: "image/svg+xml" });
}

export async function exportQrCode(
  settings: QRStyleSettings,
  data: string,
  extension: "png" | "svg",
  fileName: string
): Promise<void> {
  const rawBlob = await renderRaw(settings, data, extension);
  const finalBlob = settings.frameText
    ? extension === "png"
      ? await composeFramedPng(rawBlob, settings)
      : await composeFramedSvg(rawBlob, settings)
    : rawBlob;

  downloadBlob(finalBlob, `${fileName}.${extension}`);
}
