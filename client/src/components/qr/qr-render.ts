import { Options } from "qr-code-styling";
import { QRStyleSettings } from "./types";

export function buildQrOptions(
  settings: QRStyleSettings,
  data: string,
  size: number = 320
): Partial<Options> {
  const { gradient } = settings;
  const colorGradient = gradient.enabled
    ? {
        type: gradient.type,
        rotation: (gradient.rotation * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradient.from },
          { offset: 1, color: gradient.to },
        ],
      }
    : undefined;

  return {
    width: size,
    height: size,
    type: "svg",
    data,
    margin: settings.margin,
    image: settings.logoDataUrl,
    qrOptions: {
      errorCorrectionLevel: settings.logoDataUrl ? "H" : "Q",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 4,
    },
    dotsOptions: {
      type: settings.dotsType,
      color: settings.fgColor,
      gradient: colorGradient,
    },
    cornersSquareOptions: {
      type: settings.cornersSquareType,
      color: settings.fgColor,
      gradient: colorGradient,
    },
    cornersDotOptions: {
      type: settings.cornersDotType,
      color: settings.fgColor,
      gradient: colorGradient,
    },
    backgroundOptions: {
      color: settings.bgColor,
    },
  };
}
