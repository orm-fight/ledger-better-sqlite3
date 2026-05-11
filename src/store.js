'use strict';

const { balance } = require('./utils');

async function createAccount(db, { name, type }) {
  db.prepare(`INSERT INTO accounts (name, type) VALUES (?, ?)`).run(name, type);
}

async function postEntry(db, { description, debit, credit, amount, date }) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`amount must be a positive integer (got ${amount})`);
  }

  const result = db.prepare(
    `INSERT INTO journal_entries (description, account_debit, account_credit, amount, date)
     VALUES (?, ?, ?, ?, ?)`
  ).run(description, debit, credit, amount, date);
  return Number(result.lastInsertRowid);
}

async function getBalance(db, accountName) {
  const account = db.prepare(`SELECT type FROM accounts WHERE name = ?`).get(accountName);
  if (!account) throw new Error(`unknown account: ${accountName}`);

  const totals = db.prepare(
    `SELECT
       COALESCE(SUM(CASE WHEN account_debit  = ? THEN amount END), 0) AS debit_total,
       COALESCE(SUM(CASE WHEN account_credit = ? THEN amount END), 0) AS credit_total
     FROM journal_entries`
  ).get(accountName, accountName);

  return balance({ type: account.type, ...totals });
}

async function trialBalance(db) {
  const rows = db.prepare(`
    SELECT a.name, a.type,
           COALESCE(SUM(CASE WHEN e.account_debit  = a.name THEN e.amount END), 0) AS debit_total,
           COALESCE(SUM(CASE WHEN e.account_credit = a.name THEN e.amount END), 0) AS credit_total
    FROM accounts a
    LEFT JOIN journal_entries e
      ON e.account_debit = a.name OR e.account_credit = a.name
    GROUP BY a.name, a.type
    ORDER BY a.name
  `).all();
  return rows.map((totals) => ({
    account: totals.name,
    type: totals.type,
    balance: balance(totals),
  }));
}

module.exports = { createAccount, postEntry, getBalance, trialBalance };
