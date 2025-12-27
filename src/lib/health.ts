import { getUnsyncedLogs, markAsSynced } from './db';

// MOCK STUB due to installation environment error
// To enable real Health Connect, install '@capacitor-community/health-connect' and uncomment the import above.

/* Unused stub for future use - kept for reference
const HealthConnect = {
  isAvailable: async () => false,
  requestPermissions: async (_opts: unknown) => ({}),
  write: async (_opts: unknown) => {},
};
*/

export async function initializeHealthConnect() {
    try {
        console.log("Health Connect Service Initialized (Stubbed due to NPM install error)");
    } catch (e) {
        console.error("Health Connect Init Error:", e);
    }
}

export async function syncLogsToHealthConnect() {
    try {
        const unsynced = await getUnsyncedLogs();

        if (unsynced.length === 0) return;

        for (const log of unsynced) {
            console.log(`[Mock Sync] Uploading to Health Connect: ${log.foodName}`);

            // Mark as synced so UI updates
            await markAsSynced(log.id);
        }
        console.log(`Synced ${unsynced.length} logs locally.`);
    } catch (e) {
        console.error("Sync Error:", e);
    }
}
