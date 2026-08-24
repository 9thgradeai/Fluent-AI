// RAG (Retrieval-Augmented Generation) interfaces and basic implementation.
// Uses PostgreSQL + pgvector for vector storage.

export interface RAGDocument {
  id: string;
  userId: string;
  title: string;
  content: string;
  contentType: "text" | "job_description" | "company_info" | "technical_doc" | "custom";
  metadata?: Record<string, unknown>;
  chunkCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RAGChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
  tokenCount: number;
}

export interface RAGRetrievalResult {
  chunk: RAGChunk;
  score: number;
  document: RAGDocument;
}

export interface RAGRetriever {
  /** Store a document and chunk it */
  ingest(doc: Omit<RAGDocument, "id" | "chunkCount" | "createdAt" | "updatedAt">): Promise<RAGDocument>;

  /** Retrieve relevant chunks for a query */
  retrieve(query: string, opts: {
    userId: string;
    topK?: number;
    minScore?: number;
    documentIds?: string[];
  }): Promise<RAGRetrievalResult[]>;

  /** Delete a document and its chunks */
  deleteDocument(documentId: string): Promise<void>;

  /** List documents for a user */
  listDocuments(userId: string): Promise<RAGDocument[]>;
}

// Simple in-memory RAG for development
export class InMemoryRAG implements RAGRetriever {
  private documents = new Map<string, RAGDocument>();
  private chunks = new Map<string, RAGChunk[]>();

  async ingest(doc: Omit<RAGDocument, "id" | "chunkCount" | "createdAt" | "updatedAt">): Promise<RAGDocument> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const chunks = this.chunkText(doc.content);

    const document: RAGDocument = {
      ...doc,
      id,
      chunkCount: chunks.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ragChunks: RAGChunk[] = chunks.map((content, i) => ({
      id: `${id}_chunk_${i}`,
      documentId: id,
      content,
      tokenCount: Math.ceil(content.split(/\s+/).length),
    }));

    this.documents.set(id, document);
    this.chunks.set(id, ragChunks);

    return document;
  }

  async retrieve(query: string, opts: {
    userId: string;
    topK?: number;
    minScore?: number;
    documentIds?: string[];
  }): Promise<RAGRetrievalResult[]> {
    const { userId, topK = 5, minScore = 0.3, documentIds } = opts;
    const queryWords = new Set(query.toLowerCase().split(/\s+/));

    const results: RAGRetrievalResult[] = [];

    for (const [docId, docChunks] of this.chunks) {
      const doc = this.documents.get(docId);
      if (!doc || doc.userId !== userId) continue;
      if (documentIds && !documentIds.includes(docId)) continue;

      for (const chunk of docChunks) {
        const chunkWords = new Set(chunk.content.toLowerCase().split(/\s+/));
        const intersection = [...queryWords].filter((w) => chunkWords.has(w));
        const score = intersection.length / queryWords.size;

        if (score >= minScore) {
          results.push({ chunk, score, document: doc });
        }
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  async deleteDocument(documentId: string): Promise<void> {
    this.documents.delete(documentId);
    this.chunks.delete(documentId);
  }

  async listDocuments(userId: string): Promise<RAGDocument[]> {
    return Array.from(this.documents.values()).filter((d) => d.userId === userId);
  }

  private chunkText(text: string, maxChunkSize = 500): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];
    let currentChunk: string[] = [];

    for (const word of words) {
      currentChunk.push(word);
      if (currentChunk.length >= maxChunkSize) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(" "));
    }

    return chunks;
  }
}
