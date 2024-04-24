process.on("message", (msg) => {
    // console.log("child message received", msg)
    fetch(`https://jsonplaceholder.typicode.com/posts/${msg}`)
    .then(res => res.json())
    .then(data => process.send(data))
    // process.send(msg)
})