import fs from 'fs/promises';
import path from 'path';
import { ANALYSIS_DIR } from './routehandlers.js';

const TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const PARTICLES = ['positrons', 'antiprotons'];

async function checkPlotRanges() {
    for (const particles of PARTICLES) {
        try {
            const filePath = path.join(ANALYSIS_DIR, 'configurations', `plot_ranges_${particles}.json`);
            const fileData = await fs.readFile(filePath, 'utf8');
            const obj = JSON.parse(fileData);

            if (!obj.lastModified) {
                continue;
            }

            const elapsedMs = Date.now() - new Date(obj.lastModified).getTime();
            const elapsedSec = Math.floor(elapsedMs / 1000);

            if (elapsedMs >= TIMEOUT_MS && (obj.x !== false || obj.y !== false)) {
                obj.x = false;
                obj.y = false;
                await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
            }
        } catch (err) {
            console.error(`[DUMP MONITOR] Error reading plot_ranges_${particles}.json:`, err.message);
        }
    }
}

export function startDumpMonitor() {
    setInterval(checkPlotRanges, 1000);
}
