import { setTimeout } from 'node:timers/promises'
import path from 'node:path'
import { initialize } from "./cluster.js";
import cliProgress from 'cli-progress'
const CLUSTER_SIZE = 10
const TASK_FILE = path.join(path.resolve(), 'background-task.js')
const total = 10

const progress = new cliProgress.SingleBar({
    format: 'progress [{bar}] {percentage}% | {value}/{total} | {duration}s',
    clearOnComplete: false,
}, cliProgress.Presets.shades_classic);

progress.start(total, 0);
let totalProcessed = 0
const result = []
const cp = initialize({
    backgroundTaskFile: TASK_FILE,
    clusterSize: CLUSTER_SIZE,
    amountToBeProcessed: total,
    async onMessage(message) {
        progress.increment()
        result.push(message)
        if (++totalProcessed !== total) return
        progress.stop()
        cp.killAll()
        console.log({
            total: result.length,
            result:result.sort((a, b) => a.id - b.id)
        })
        process.exit()
    }
})

// await setTimeout(1000)

for (const i of Array(total).keys()) {
    const page = i + 1
    // const request = `https://jsonplaceholder.typicode.com/posts/${page}`
    cp.sendTochild(page)
}