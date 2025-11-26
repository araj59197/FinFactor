// Custom memory store with time-based expiration
// Built for high-speed data retrieval in production systems

class MemoryDataStore {
  constructor(capacity = 100, expirationMs = 30 * 60 * 1000) {
    this.capacity = capacity;
    this.timeToLive = expirationMs;
    this.storage = new Map();
    this.accessOrder = [];
  }

  // Fetch item and update access tracking
  fetch(identifier) {
    const exists = this.storage.has(identifier);
    if (!exists) return null;

    const record = this.storage.get(identifier);
    const currentTime = Date.now();

    // Validate expiration timestamp
    if (currentTime > record.validUntil) {
      this.remove(identifier);
      return null;
    }

    // Update access order for LRU tracking
    this.updateAccessOrder(identifier);

    return record.content;
  }

  updateAccessOrder(identifier) {
    const position = this.accessOrder.indexOf(identifier);
    if (position > -1) {
      this.accessOrder.splice(position, 1);
    }
    this.accessOrder.push(identifier);
  }

  // Store new data with automatic eviction
  store(identifier, content, customTTL = this.timeToLive) {
    // Remove if already present
    if (this.storage.has(identifier)) {
      this.remove(identifier);
    }

    // Evict oldest entry when at capacity
    if (this.storage.size >= this.capacity) {
      const oldestKey = this.accessOrder.shift();
      this.storage.delete(oldestKey);
    }

    const now = Date.now();
    this.storage.set(identifier, {
      content: content,
      validUntil: now + customTTL,
      storedAt: now,
    });
    
    this.accessOrder.push(identifier);
  }

  // Check item validity without fetching
  contains(identifier) {
    return this.fetch(identifier) !== null;
  }

  remove(identifier) {
    this.storage.delete(identifier);
    const pos = this.accessOrder.indexOf(identifier);
    if (pos > -1) this.accessOrder.splice(pos, 1);
  }

  reset() {
    this.storage.clear();
    this.accessOrder = [];
  }

  currentSize() {
    return this.storage.size;
  }

  getMetrics() {
    const currentCount = this.storage.size;
    return {
      entriesCount: currentCount,
      maxCapacity: this.capacity,
      usageRatio: Math.round((currentCount / this.capacity) * 100),
    };
  }

  // Remove stale entries
  purgeExpired() {
    const timestamp = Date.now();
    const keysToRemove = [];
    
    for (const [id, record] of this.storage.entries()) {
      if (timestamp > record.validUntil) {
        keysToRemove.push(id);
      }
    }
    
    keysToRemove.forEach(id => this.remove(id));
  }
}

let storeInstance = null;

function getDataStore(capacity, ttlInMinutes) {
  if (!storeInstance) {
    const ttlMilliseconds = ttlInMinutes * 60 * 1000;
    storeInstance = new MemoryDataStore(capacity, ttlMilliseconds);
    
    setInterval(() => {
      storeInstance.purgeExpired();
    }, 5 * 60 * 1000);
  }
  return storeInstance;
}

module.exports = {
  MemoryDataStore,
  getCacheInstance: getDataStore,
};
