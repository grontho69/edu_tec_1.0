/**
 * Directed Acyclic Graph (DAG) for Syllabus Topic Dependencies.
 *
 * Models academic dependencies (e.g. Vectors -> Dynamics -> Circular Motion -> Rotational).
 * When a student exhibits weakness in a topic (accuracy < 50%), this algorithm
 * traverses prerequisite ancestors and computes a topological remedial study path.
 */

export interface TopicNode {
  id: number;
  name: string;
  subjectCode: string;
  chapterNumber: number;
}

export class TopicDAG {
  private adjacencyList: Map<number, Set<number>> = new Map(); // prereqId -> Set of dependentIds
  private reverseAdjacency: Map<number, Set<number>> = new Map(); // dependentId -> Set of prereqIds
  private nodes: Map<number, TopicNode> = new Map();

  addTopic(topic: TopicNode): void {
    this.nodes.set(topic.id, topic);
    if (!this.adjacencyList.has(topic.id)) {
      this.adjacencyList.set(topic.id, new Set());
    }
    if (!this.reverseAdjacency.has(topic.id)) {
      this.reverseAdjacency.set(topic.id, new Set());
    }
  }

  /**
   * Defines a prerequisite edge: `prerequisiteId` must be understood before `dependentId`.
   */
  addDependency(prerequisiteId: number, dependentId: number): void {
    if (!this.adjacencyList.has(prerequisiteId)) {
      this.adjacencyList.set(prerequisiteId, new Set());
    }
    if (!this.reverseAdjacency.has(dependentId)) {
      this.reverseAdjacency.set(dependentId, new Set());
    }

    this.adjacencyList.get(prerequisiteId)!.add(dependentId);
    this.reverseAdjacency.get(dependentId)!.add(prerequisiteId);
  }

  /**
   * Computes the full prerequisite path for a target weak topic using BFS/DFS
   * and Kahn's Topological Sort algorithm.
   * Returns prerequisites in the optimal order the student should study them!
   */
  getRemedialStudyPath(targetTopicId: number): TopicNode[] {
    const requiredTopicIds = new Set<number>();
    const queue = [targetTopicId];
    requiredTopicIds.add(targetTopicId);

    // BFS on reverse graph to find all ancestors
    while (queue.length > 0) {
      const current = queue.shift()!;
      const prereqs = this.reverseAdjacency.get(current);
      if (prereqs) {
        for (const p of prereqs) {
          if (!requiredTopicIds.has(p)) {
            requiredTopicIds.add(p);
            queue.push(p);
          }
        }
      }
    }

    // Kahn's Algorithm on the subgraph induced by requiredTopicIds
    const inDegree = new Map<number, number>();
    for (const id of requiredTopicIds) {
      inDegree.set(id, 0);
    }

    for (const u of requiredTopicIds) {
      const neighbors = this.adjacencyList.get(u);
      if (neighbors) {
        for (const v of neighbors) {
          if (requiredTopicIds.has(v)) {
            inDegree.set(v, (inDegree.get(v) || 0) + 1);
          }
        }
      }
    }

    const topoQueue: number[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) {
        topoQueue.push(id);
      }
    }

    const orderedIds: number[] = [];
    while (topoQueue.length > 0) {
      const u = topoQueue.shift()!;
      orderedIds.push(u);

      const neighbors = this.adjacencyList.get(u);
      if (neighbors) {
        for (const v of neighbors) {
          if (requiredTopicIds.has(v)) {
            const newDeg = (inDegree.get(v) || 1) - 1;
            inDegree.set(v, newDeg);
            if (newDeg === 0) {
              topoQueue.push(v);
            }
          }
        }
      }
    }

    return orderedIds
      .map((id) => this.nodes.get(id))
      .filter((n): n is TopicNode => n !== undefined);
  }
}
