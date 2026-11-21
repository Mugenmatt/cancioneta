import { parseMapPayload, type MapNode } from './mapLogic';

export interface MapFileIO {
  read(uri: string): Promise<string>;
  remove(uri: string): void;
}

export async function loadMapFile(uri: string, io: MapFileIO, nextId: () => string): Promise<MapNode> {
  const content = await io.read(uri);
  try {
    return parseMapPayload(content, nextId);
  } finally {
    io.remove(uri);
  }
}
