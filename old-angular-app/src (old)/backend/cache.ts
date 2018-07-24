

var _fakeLRUcount = 0;
export const fakeDemoRedisCache = {
  _cache: {},
  get: (key) => {
    let cache = fakeDemoRedisCache._cache[key];
    _fakeLRUcount++;
    if (_fakeLRUcount >= 10) {
      fakeDemoRedisCache.clear();
      _fakeLRUcount = 0;
    }
    return cache;
  },
  set: (key, data) => fakeDemoRedisCache._cache[key] = data,
  clear: () => fakeDemoRedisCache._cache = {}
};

// update: 2025-07-31T20:16:06.048652
