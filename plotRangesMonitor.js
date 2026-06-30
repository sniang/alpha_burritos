import fs from 'fs/promises';
import path from 'path';
import { ANALYSIS_DIR } from './routehandlers.js';

const TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes
const PARTICLES = ['positrons', 'antiprotons'];

async function checkPlotRanges() {
    const parts = [];

    for (const particles of PARTICLES) {
        try {
            const filePath = path.join(ANALYSIS_DIR, 'configurations', `plot_ranges_${particles}.json`);
            const fileData = await fs.readFile(filePath, 'utf8');
            const obj = JSON.parse(fileData);

            if (!obj.lastModified) {
                parts.push(`${particles}: no timestamp`);
                continue;
            }

            const elapsedMs = Date.now() - new Date(obj.lastModified).getTime();
            const elapsedSec = Math.floor(elapsedMs / 1000);
            parts.push(`${particles}: ${elapsedSec}s`);

            if (elapsedMs >= TIMEOUT_MS && (obj.x !== false || obj.y !== false)) {
                obj.x = false;
                obj.y = false;
                await fs.writeFile(filePath, JSON.stringify(obj, null, 2), 'utf8');
                console.log(`[DUMP MONITOR] Reset x/y to false in plot_ranges_${particles}.json`);
            }
        } catch (err) {
            parts.push(`${particles}: error`);
            console.error(`[DUMP MONITOR] Error reading plot_ranges_${particles}.json:`, err.message);
        }
    }

    console.log(`[DUMP MONITOR] Last range modification — ${parts.join(' | ')}`);
}

export function startDumpMonitor() {
    setInterval(checkPlotRanges, 1000);
}
