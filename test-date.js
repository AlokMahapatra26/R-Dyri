const entry = { created_at: "2026-03-05T12:29:58.000Z", logical_date: "2026-03-05" }
const dateObj = new Date(entry.logical_date || entry.created_at)

console.log("local tz format:", dateObj.toString())
console.log("UTC format:", dateObj.toUTCString())
console.log("yyyy format:", dateObj.getFullYear(), typeof dateObj.getFullYear())
console.log("M format:", dateObj.getMonth() + 1, typeof (dateObj.getMonth() + 1))
