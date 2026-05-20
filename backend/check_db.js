const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
Promise.all([
  p.$queryRawUnsafe('DESCRIBE Pengukuran'),
  p.$queryRawUnsafe('DESCRIBE Anak')
]).then(([pengukuran, anak]) => {
  console.log('=== Pengukuran ===')
  console.log(pengukuran.map(r => r.Field).join(', '))
  console.log('=== Anak ===')
  console.log(anak.map(r => r.Field).join(', '))
  p.$disconnect()
}).catch(e => { console.error(e.message); p.$disconnect() })
