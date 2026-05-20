import mysql from 'mysql2/promise';

const dbUrl = 'mysql://VFF8hzfAx1FfQne.root:iaFlKRdUcWtv1ujOP32pxHTNhhEeFPfo@ep-t4ni387b5e83b7519dc8.epsrv-t4n281l4mrmemi4zls9a.ap-southeast-1.privatelink.aliyuncs.com:4000/19e1e149-aba2-8eb8-8000-0922c9802b03';

async function clean() {
  const conn = await mysql.createConnection(dbUrl);
  
  const [tables] = await conn.query('SHOW TABLES');
  console.log('Existing tables:', tables.map(t => Object.values(t)[0]));
  
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of tables) {
    const tableName = Object.values(t)[0];
    await conn.query(`DROP TABLE IF EXISTS \`${tableName}\``);
    console.log('Dropped:', tableName);
  }
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  
  await conn.end();
  console.log('Database cleaned');
}

clean().catch(console.error);
