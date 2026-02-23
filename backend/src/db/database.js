import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

function ensureParentDirExists(filePath) {
	const dir = path.dirname(filePath);
	fs.mkdirSync(dir, { recursive: true });
}

function readSchemaSql() {
	const schemaPath = path.resolve(process.cwd(), "src", "db", "schema.sql");
	return fs.readFileSync(schemaPath, "utf-8");
}

export function openDb(databasePath) {
	ensureParentDirExists(databasePath);

	return new sqlite.Database(databasePath);
}

export function run(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.run(sql, params, function onRun(err) {
			if (err) return reject(err);
			resolve({ lastID: this.lastID, changes: this.changes });
		});
	});
}

export function get(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.get(sql, params, (err, row) => {
			if (err) return reject(err);
			resolve(row ?? null);
		});
	});
}

export function all(db, sql, params = []) {
	return new Promise((resolve, reject) => {
		db.all(sql, params, (err, rows) => {
			if (err) return reject(err);
			resolve(rows ?? []);
		});
	});
}

export function exec(db, sql) {
	return new Promise((resolve, reject) => {
		db.exec(sql, (err) => {
			if (err) return reject(err);
			resolve();
		});
	});
}

export async function initDb(databasePath) {
	const db = openDb(databasePath);

	// Ensure FK constraints are actually enforced
	await exec(db, "PRAGMA foreign_keys = ON;");

	// Apply schema
	const schemaSql = readSchemaSql();
	await exec(db, schemaSql);

	return db;
}
