import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * A daemon that periodically checks and updates the Node.js process timezone
 * to match the system timezone.
 */
export class TimeZoneDaemon {
    private checkTimer?: NodeJS.Timeout;

    constructor(checkInterval: number = 60000) {
        this.checkTimer = setInterval(() => this.checkAndUpdateTimeZone(), checkInterval);
    }

    stop() {
        clearInterval(this.checkTimer);
    }

    private async checkAndUpdateTimeZone() {
        try {
            const { stdout } = await execPromise('timedatectl show -p Timezone --value');
            const systemTimezone = stdout.toString().trim();
            const nodeTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            if (systemTimezone !== nodeTimezone) {
                process.env.TZ = systemTimezone;
            }
        } catch (error) {
            console.error('Error checking/updating timezone:', error);
        }
    }
}
