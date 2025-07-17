import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({ orderBy: { name: 'asc' } });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar funcionários.' });
  }
};

export const createEmployee = async (req, res) => {
  const { name, percentage } = req.body;
  try {
    const employee = await prisma.employee.create({ data: { name, percentage: parseFloat(percentage) } });
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar funcionário.' });
  }
};

export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, percentage } = req.body;
  try {
    const employee = await prisma.employee.update({ where: { id }, data: { name, percentage: parseFloat(percentage) } });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar funcionário.' });
  }
};

export const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.employee.delete({ where: { id } });
    res.json({ message: 'Funcionário excluído.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir funcionário.' });
  }
}; 