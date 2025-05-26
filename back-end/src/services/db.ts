import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('DB connection error:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite.');
});

db.serialize(() => {

    db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      id TEXT PRIMARY KEY,
      userName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS RefreshTokens (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS Conversations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      userId TEXT NOT NULL,
      createdDateTime TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS Messages (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      parentMessageId TEXT,
      conversationId TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('error','success','pending')),
      description TEXT NOT NULL,
      decision TEXT NOT NULL,
      considerations TEXT NOT NULL,
      createdDateTime TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(userId) REFERENCES Users(id) ON DELETE CASCADE,
      FOREIGN KEY(parentMessageId) REFERENCES Messages(id) ON DELETE SET NULL,
      FOREIGN KEY(conversationId) REFERENCES Conversations(id) ON DELETE CASCADE
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS AiResponses (
      id TEXT PRIMARY KEY,
      messageId TEXT NOT NULL,
      decisionCategory TEXT NOT NULL,
      cognitiveBiases TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      missingAlternatives TEXT NOT NULL,
      createdDateTime       TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY(messageId) REFERENCES Messages(id) ON DELETE CASCADE
    )
  `);
});


function dbGet<T>(sql: string, params: any[]): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row as T)));
    });
}

function dbRun(sql: string, params: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, (err) => (err ? reject(err) : resolve()));
    });
}

function dbAll<T>(sql: string, params: any[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows as T[]));
    });
}

export { db,dbRun,dbGet, dbAll };