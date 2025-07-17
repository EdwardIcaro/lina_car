import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const searchCustomers = async (req, res) => {
  const search = req.query.search || '';
  try {
    let customers;
    if (search.length === 0) {
      customers = await prisma.customer.findMany({ orderBy: { name: 'asc' }, take: 20 });
    } else {
      customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        },
        orderBy: { name: 'asc' },
        take: 10,
      });
    }
    res.json(customers);
  } catch (err) {
    console.error('Erro detalhado ao buscar clientes:', err);
    res.status(500).json({ message: 'Erro ao buscar clientes.' });
  }
};

export const getCustomerVehicles = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículos do cliente.' });
  }
}; 