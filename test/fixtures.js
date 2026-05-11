'use strict';

const { open, init } = require('../src/db');

function createFixture() {
  const db = open(':memory:');
  init(db);
  return {
    db,
    cleanup: () => db.close(),
  };
}

module.exports = { createFixture };
