import { fork } from 'child_process'

function roundRoubin(array, index = 0) {
    return function () {
        if (index >= array.length) index = 0

        return array[index++]
    }
}

function initializeCluster({ backgroundTaskFile, clusterSize, onMessage }) {
    const processes = new Map()
    for (let index = 0; index < clusterSize; index++) {

        const child = fork(backgroundTaskFile)

        child.on('exit', () => {
            // console.log(`process ${child.pid} exited`)
            processes.delete(child.pid)
        })

        child.on('error', error => {
            console.log(`process ${child.pid} has an error`, error)
            process.exit(1)
        })

        child.on('message', (message) => {
            // console.log('cluster message received', msg)
            onMessage(message)
        })

        processes.set(child.pid, child)

    }

    return {
        getProcess: roundRoubin([...processes.values()]),
        killAll: () => {
            // for (const pid of processes.keys()) {
            //     processes.get(pid).kill()
            // }
            processes.forEach((child) => child.kill())
        }
    }
}

export function initialize({ backgroundTaskFile, clusterSize, onMessage }) {
    const { getProcess, killAll } = initializeCluster({ backgroundTaskFile, clusterSize, onMessage })
    let counter = 0
    function sendTochild(message) {
        // console.log(`sending message ${++counter}`)
        const child = getProcess()
        child.send(message)
    }

    return {
        sendTochild: sendTochild.bind(this),
        killAll: killAll.bind(this)
    }
}