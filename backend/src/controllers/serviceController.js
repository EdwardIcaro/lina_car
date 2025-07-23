import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar serviços.' });
  }
};

export const createService = async (req, res) => {
  const { name, price, type } = req.body;
  try {
    const service = await prisma.service.create({ data: { name, price, type } });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar serviço.' });
  }
};

export const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, price, type } = req.body;
  try {
    const service = await prisma.service.update({ where: { id }, data: { name, price, type } });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar serviço.' });
  }
};

export const deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.service.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir serviço.' });
  }
}; 