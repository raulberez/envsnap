const fs = require('fs');
const path = require('path');
const { getSnapshotsDir } = require('./snapshot');

const AUDIT_LOG_FILE = 'audit.log';

function getAuditLogPath(snapshotsDir) {
  const dir = snapshotsDir || getSnapshotsDir();
  return path.join(dir, AUDIT_LOG_FILE);
}

function loadAuditLog(snapshotsDir) {
  const logPath = getAuditLogPath(snapshotsDir);
  if (!fs.existsSync(logPath)) return [];
  try {
    const raw = fs.readFileSync(logPath, 'utf8').trim();
    if (!raw) return [];
    return raw.split('\n').map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

function appendAuditEntry(entry, snapshotsDir) {
  const logPath = getAuditLogPath(snapshotsDir);
  const dir = path.dirname(logPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const record = { ...entry, timestamp: entry.timestamp || new Date().toISOString() };
  fs.appendFileSync(logPath, JSON.stringify(record) + '\n', 'utf8');
  return record;
}

function recordAction(action, snapshotName, details = {}, snapshotsDir) {
  return appendAuditEntry({ action, snapshotName, ...details }, snapshotsDir);
}

function formatAuditLog(entries) {
  if (!entries.length) return 'No audit entries found.';
  const lines = entries.map(e => {
    const ts = e.timestamp || 'unknown';
    const detail = Object.entries(e)
      .filter(([k]) => !['action', 'snapshotName', 'timestamp'].includes(k))
      .map(([k, v]) => `${k}=${v}`)
      .join(' ');
    return `[${ts}] ${e.action} ${e.snapshotName || ''}${detail ? ' ' + detail : ''}`.trim();
  });
  return lines.join('\n');
}

function clearAuditLog(snapshotsDir) {
  const logPath = getAuditLogPath(snapshotsDir);
  if (fs.existsSync(logPath)) fs.writeFileSync(logPath, '', 'utf8');
}

module.exports = { getAuditLogPath, loadAuditLog, appendAuditEntry, recordAction, formatAuditLog, clearAuditLog };
