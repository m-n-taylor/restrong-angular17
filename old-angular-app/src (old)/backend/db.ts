// Our API for demos only
export const fakeDataBase = {
  get() {
    let res = { data: 'This fake data came from the db on the server.' };
    return Promise.resolve(res);
  }
};

// update: 2025-07-31T20:23:32.150366

// update: 2025-08-01T01:05:46.711877
