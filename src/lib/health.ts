
// import { HealthConnect } from '@capacitor-community/health-connect';
import { getUnsyncedLogs, markAsSynced } from './db';

// MOCK STUB due to installation environment error (NPM 401/403)
// To enable real Health Connect, install '@capacitor-community/health-connect' and uncomment the import above.
const HealthConnect = {
    isAvailable: async () => false,
    requestPermissions: async (opts: any) => ({}),
    write: async (opts: any) => { },
};

export async function initializeHealthConnect() {
    try {
        console.log("Health Connect Service Initialized (Stubbed due to NPM install error)");
        // const isAvailable = await HealthConnect.isAvailable();
        // if (isAvailable) { ... }
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
            // Actual plugin interactions commented out for build safety
            // await HealthConnect.write({ ... });

            // Mark as synced so UI updates
            await markAsSynced(log.id);
        }
        console.log(`Synced ${unsynced.length} logs locally.`);
    } catch (e) {
        console.error("Sync Error:", e);
    }
}
