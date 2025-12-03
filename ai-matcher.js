// AI-powered semantic matching using TensorFlow.js Universal Sentence Encoder
// Falls back to rule-based matching if AI is not available

class AIMatcher {
  constructor() {
    this.model = null;
    this.loading = false;
    this.loaded = false;
    this.useAI = true; // Toggle to enable/disable AI
  }

  // Load model from local bundle (REQUIRED for Chrome Web Store compliance)
  // Model files are bundled in libs/use_model/
  // This prevents USE from fetching the model from the internet (not allowed in MV3)
  async loadLocalUSE(useEncoder) {
    // Get the local path to the model directory
    // chrome.runtime.getURL() resolves to chrome-extension://.../libs/use_model/
    const modelPath = chrome.runtime.getURL("libs/use_model/");
    const model = await useEncoder.load(modelPath);
    return model;
  }

  // Load TensorFlow.js and Universal Sentence Encoder
  async loadModel() {
    if (this.loaded || this.loading) {
      return this.loaded;
    }

    this.loading = true;

    try {
      // Check if TensorFlow.js is available
      if (typeof tf === "undefined") {
        console.warn(
          "TensorFlow.js not loaded, using rule-based matching only"
        );
        this.loaded = false;
        this.loading = false;
        return false;
      }

      // Check if Universal Sentence Encoder is available
      if (
        typeof use === "undefined" &&
        typeof window !== "undefined" &&
        typeof window.use === "undefined"
      ) {
        console.warn("Universal Sentence Encoder not loaded");
        this.loaded = false;
        this.loading = false;
        return false;
      }

      // Use global 'use' or window.use
      const useEncoder =
        typeof use !== "undefined"
          ? use
          : typeof window !== "undefined"
          ? window.use
          : null;
      if (!useEncoder) {
        console.warn("Universal Sentence Encoder not available");
        this.loaded = false;
        this.loading = false;
        return false;
      }

      // Load model from local bundle - REQUIRED for MV3 compliance
      // This prevents fetching from the internet
      try {
        // Use loadLocalUSE to load from local path
        // This ensures the model is loaded from chrome-extension://... path, not from internet
        this.model = await this.loadLocalUSE(useEncoder);
        this.loaded = true;
        console.log("AI model loaded successfully from local bundle");
        return true;
      } catch (modelError) {
        console.warn(
          "AI model loading failed, falling back to rule-based matching:",
          modelError.message
        );
        // Gracefully fall back to rule-based matching
        this.loaded = false;
        this.useAI = false;
        return false;
      }
    } catch (error) {
      console.warn(
        "Failed to load AI model, falling back to rule-based matching:",
        error
      );
      this.loaded = false;
      this.useAI = false;
      return false;
    } finally {
      this.loading = false;
    }
  }

  // Calculate cosine similarity between two vectors
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }

  // Get semantic embedding for text
  async getEmbedding(text) {
    if (!this.model || !this.loaded) {
      return null;
    }

    try {
      const embeddings = await this.model.embed([text]);
      const embeddingArray = await embeddings.array();
      return embeddingArray[0];
    } catch (error) {
      console.error("Error getting embedding:", error);
      return null;
    }
  }

  // Find best match using AI semantic similarity
  async findBestMatchAI(field, userData) {
    if (!this.loaded || !this.useAI) {
      return null;
    }

    const fieldText =
      `${field.label} ${field.placeholder} ${field.name} ${field.id}`.trim();

    if (!fieldText) {
      return null;
    }

    try {
      // Get embedding for field text
      const fieldEmbedding = await this.getEmbedding(fieldText);
      if (!fieldEmbedding) {
        return null;
      }

      let bestMatch = null;
      let bestScore = 0;
      const threshold = 0.5; // Minimum similarity threshold for AI

      // Compare with each user data key
      for (const [key, value] of Object.entries(userData)) {
        // Create descriptive text for the key
        const keyText = this.formatKeyAsText(key);
        const keyEmbedding = await this.getEmbedding(keyText);

        if (keyEmbedding) {
          const similarity = this.cosineSimilarity(
            fieldEmbedding,
            keyEmbedding
          );

          // Boost score for type matches
          let adjustedScore = similarity;
          if (this.isTypeMatch(field.type, key, value)) {
            adjustedScore = Math.min(1.0, similarity + 0.15);
          }

          if (adjustedScore > bestScore && adjustedScore >= threshold) {
            bestScore = adjustedScore;
            bestMatch = { key, value, score: adjustedScore, method: "AI" };
          }
        }
      }

      return bestMatch;
    } catch (error) {
      console.error("Error in AI matching:", error);
      return null;
    }
  }

  // Format data key as natural language for better embedding
  formatKeyAsText(key) {
    // Convert snake_case or camelCase to readable text
    const text = key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .toLowerCase()
      .trim();

    // Add context based on common patterns
    const contextMap = {
      "full name": "full name person",
      email: "email address contact",
      phone: "phone number telephone contact",
      address: "street address location",
      company: "company organization employer",
      "date of birth": "date of birth birthday",
      "zip code": "zip code postal code",
      city: "city location",
      country: "country location",
    };

    return contextMap[text] || text;
  }

  // Check if field type matches data type
  isTypeMatch(fieldType, key, value) {
    const keyLower = key.toLowerCase();

    // Email matching
    if (
      fieldType === "email" &&
      (keyLower.includes("email") || keyLower.includes("mail"))
    ) {
      return true;
    }

    // Phone matching
    if (
      fieldType === "tel" &&
      (keyLower.includes("phone") || keyLower.includes("tel"))
    ) {
      return true;
    }

    // Date matching
    if (
      fieldType === "date" &&
      (keyLower.includes("date") || keyLower.includes("birth"))
    ) {
      return true;
    }

    return false;
  }

  // Enable/disable AI matching
  setUseAI(enabled) {
    this.useAI = enabled;
  }

  // Check if AI is available
  isAvailable() {
    return this.loaded && this.useAI;
  }
}

// Export singleton instance
const aiMatcher = new AIMatcher();
