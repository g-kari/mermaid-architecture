import * as Y from "yjs";
import { useCanvasStore } from "../stores/canvas";
import type { CanvasData, CanvasEdge, CanvasGroup, CanvasNode } from "../types";

const BINDING_ORIGIN = "canvas-binding";

type DeepHandler = (_events: Y.YEvent<Y.Map<string>>[], tx: Y.Transaction) => void;

export class YjsCanvasBinding {
  private doc: Y.Doc;
  private canvasMap: Y.Map<Y.Map<string>>;
  private nodesMap: Y.Map<string>;
  private edgesMap: Y.Map<string>;
  private groupsMap: Y.Map<string>;
  private unsubscribeStore: (() => void) | null = null;
  private remoteHandler: DeepHandler | null = null;
  private applyingRemote = false;
  private lastRemoteData: CanvasData | null = null;

  constructor(doc: Y.Doc) {
    this.doc = doc;
    this.canvasMap = doc.getMap("canvas") as Y.Map<Y.Map<string>>;

    this.nodesMap = this.getOrCreateSubMap("nodes");
    this.edgesMap = this.getOrCreateSubMap("edges");
    this.groupsMap = this.getOrCreateSubMap("groups");

    this.observeRemoteChanges();
    this.observeLocalChanges();
  }

  private getOrCreateSubMap(key: string): Y.Map<string> {
    const existing = this.canvasMap.get(key);
    if (existing) return existing;
    const subMap = new Y.Map<string>();
    this.doc.transact(() => {
      this.canvasMap.set(key, subMap);
    }, BINDING_ORIGIN);
    return subMap;
  }

  private observeRemoteChanges() {
    this.remoteHandler = (_events, tx) => {
      if (tx.origin === BINDING_ORIGIN) return;
      this.applyingRemote = true;
      try {
        const data = this.yjsToCanvasData();
        this.lastRemoteData = data;
        useCanvasStore.getState().applyRemoteData(data);
      } finally {
        this.applyingRemote = false;
      }
    };

    this.nodesMap.observeDeep(this.remoteHandler);
    this.edgesMap.observeDeep(this.remoteHandler);
    this.groupsMap.observeDeep(this.remoteHandler);
  }

  private observeLocalChanges() {
    let prevData: CanvasData | null = null;

    this.unsubscribeStore = useCanvasStore.subscribe((state) => {
      if (this.applyingRemote) return;
      const { data } = state;
      if (data === prevData || data === this.lastRemoteData) return;
      prevData = data;
      this.lastRemoteData = null;
      this.pushToYjs(data);
    });
  }

  pushToYjs(data: CanvasData) {
    this.doc.transact(() => {
      this.syncMap(this.nodesMap, data.nodes, (n) => n.id);
      this.syncMap(this.edgesMap, data.edges, (e) => e.id);
      this.syncMap(this.groupsMap, data.groups, (g) => g.id);
    }, BINDING_ORIGIN);
  }

  private syncMap<T>(ymap: Y.Map<string>, items: T[], getId: (item: T) => string) {
    const itemIds = new Set<string>();

    for (const item of items) {
      const id = getId(item);
      itemIds.add(id);
      const serialized = JSON.stringify(item);
      if (ymap.get(id) !== serialized) {
        ymap.set(id, serialized);
      }
    }

    for (const key of ymap.keys()) {
      if (!itemIds.has(key)) {
        ymap.delete(key);
      }
    }
  }

  yjsToCanvasData(): CanvasData {
    const nodes: CanvasNode[] = [];
    const edges: CanvasEdge[] = [];
    const groups: CanvasGroup[] = [];

    for (const [, val] of this.nodesMap.entries()) {
      try {
        nodes.push(JSON.parse(val) as CanvasNode);
      } catch {
        // skip invalid entries
      }
    }
    for (const [, val] of this.edgesMap.entries()) {
      try {
        edges.push(JSON.parse(val) as CanvasEdge);
      } catch {
        // skip
      }
    }
    for (const [, val] of this.groupsMap.entries()) {
      try {
        groups.push(JSON.parse(val) as CanvasGroup);
      } catch {
        // skip
      }
    }

    return { nodes, edges, groups };
  }

  initFromCanvasData(data: CanvasData) {
    this.pushToYjs(data);
  }

  destroy() {
    this.unsubscribeStore?.();
    if (this.remoteHandler) {
      this.nodesMap.unobserveDeep(this.remoteHandler);
      this.edgesMap.unobserveDeep(this.remoteHandler);
      this.groupsMap.unobserveDeep(this.remoteHandler);
    }
  }
}
