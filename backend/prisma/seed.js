import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const services = [
    { name: 'Lavagem Simples', price: 30, type: 'carro' },
    { name: 'Lavagem Completa', price: 50, type: 'carro' },
    { name: 'Polimento', price: 120, type: 'carro' },
    { name: 'Combo Promo', price: 150, type: 'carro' },
    { name: 'Lavagem Simples', price: 20, type: 'moto' },
    { name: 'Lavagem Completa', price: 35, type: 'moto' },
    { name: 'Polimento', price: 80, type: 'moto' },
    { name: 'Combo Promo', price: 100, type: 'moto' },
  ];
  for (const service of services) {
    await prisma.service.upsert({
      where: { name: service.name + '_' + service.type },
      update: { price: service.price, type: service.type },
      create: { ...service, name: service.name + '_' + service.type },
    });
  }
  console.log('Serviços padrão de carro e moto inseridos!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect()); 