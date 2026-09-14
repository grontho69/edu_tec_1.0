/**
 * Client-side Trie Search Engine for instant O(L) question & topic filtering.
 */

export interface TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  isEndOfWord: boolean;
  items: Set<T>;
}

export class TrieSearchEngine<T> {
  private root: TrieNode<T>;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode<T> {
    return {
      children: new Map(),
      isEndOfWord: false,
      items: new Set(),
    };
  }

  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }

  insert(text: string, item: T): void {
    const words = this.tokenize(text);
    for (const word of words) {
      let current = this.root;
      for (let i = 0; i < word.length; i++) {
        const char = word[i]!;
        if (!current.children.has(char)) {
          current.children.set(char, this.createNode());
        }
        current = current.children.get(char)!;
        current.items.add(item);
      }
      current.isEndOfWord = true;
    }
  }

  searchPrefix(prefix: string): T[] {
    const clean = prefix.trim().toLowerCase();
    if (!clean) return [];

    let current = this.root;
    for (let i = 0; i < clean.length; i++) {
      const char = clean[i]!;
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    return Array.from(current.items);
  }

  searchMultiWord(query: string): T[] {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    let resultSet: Set<T> | null = null;

    for (const token of tokens) {
      const matches = this.searchPrefix(token);
      const matchSet = new Set(matches);

      if (resultSet === null) {
        resultSet = matchSet;
      } else {
        const intersected = new Set<T>();
        for (const item of resultSet) {
          if (matchSet.has(item)) {
            intersected.add(item);
          }
        }
        resultSet = intersected;
      }

      if (resultSet.size === 0) break;
    }

    return resultSet ? Array.from(resultSet) : [];
  }

  clear(): void {
    this.root = this.createNode();
  }
}
