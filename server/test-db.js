const pool = require("./db");

async function test(){
    const res = await pool.query("SELECT * FROM users");
    console.log(res.rows);
}
test();