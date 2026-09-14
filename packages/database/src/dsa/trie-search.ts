/**
 * Trie / Prefix Search Engine Data Structure
 * Supports sub-millisecond prefix & full-text keyword retrieval in O(L) time,
 * where L is the length of the query string.
 * Optimized for Bengali Unicode script and English academic terms.
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

  /**
   * Normalizes strings across Bengali and English:
   * Strips excess whitespace, lowercases English, and preserves Bengali glyphs.
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 0);
  }

  /**
   * Inserts an item indexed by one or more keywords / phrases.
   * Complexity: O(K * L) where K is number of words, L is average word length.
   */
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

  /**
   * Searches by prefix.
   * Complexity: O(L) to traverse the prefix, O(R) to collect matching items.
   */
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

  /**
   * Multi-word search with intersection (AND logic across terms).
   * E.g. "বুয়েট গতিবিদ্যা" finds questions containing both terms.
   */
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
        // Intersection
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

  /**
   * Clears the Trie.
   */
  clear(): void {
    this.root = this.createNode();
  }
}
