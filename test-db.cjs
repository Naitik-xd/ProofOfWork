const { Client } = require('pg');

const connectionString = 'postgres://postgres:312e9af7-cf7e-4751-8b84-08395dc215e7@db.pxbetfnkgbojplvbyxxn.supabase.co:5432/postgres';

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully!");
    const res = await client.query('SELECT 1 as val');
    console.log(res.rows);
  } catch (err) {
    console.error("Connection error:", err.message);
  } finally {
    await client.end();
  }
}

run();
