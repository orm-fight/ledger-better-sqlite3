'use strict';

const Database = require('better-sqlite3');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS accounts (
    name TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('asset','liability','equity','revenue','expense'))
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    description    TEXT    NOT NULL,
    account_debit  TEXT    NOT NULL REFERENCES accounts(name),
    account_credit TEXT    NOT NULL REFERENCES accounts(name),
    amount         INTEGER NOT NULL CHECK (amount > 0),
    date           TEXT    NOT NULL
  );
`;

function open(filename = ':memory:') {
  const db = new Database(filename);
  db.pragma('foreign_keys = ON');
  return db;
}

function init(db) {
  db.exec(SCHEMA);
}

module.exports = { open, init };
