import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

function isWeb(): boolean {
  return Platform.OS === 'web';
}

export function isWebPlatform(): boolean {
  return isWeb();
}

function isBlobUri(uri: string): boolean {
  return isWeb() && uri.startsWith('blob:');
}

export async function saveTextFile(name: string, content: string, mimeType: string): Promise<void> {
  if (isWeb()) {
    if (typeof document === 'undefined') return;
    const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return;
  }
  const file = new File(Paths.cache, name);
  try {
    file.write(content);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
    }
  } finally {
    try { file.delete(); } catch { void 0; }
  }
}

export async function readTextFile(uri: string): Promise<string> {
  if (isBlobUri(uri)) {
    const response = await fetch(uri);
    return response.text();
  }
  return new File(uri).text();
}

export function releaseTextFile(uri: string): void {
  if (isBlobUri(uri)) {
    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(uri);
    return;
  }
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    return;
  }
}

export async function printHtml(html: string, title: string): Promise<void> {
  if (isWeb()) {
    await Print.printAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: title });
  }
}

export async function shareText(text: string, title: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(text, { dialogTitle: title });
    return;
  }
  throw new Error('sharing unavailable');
}
