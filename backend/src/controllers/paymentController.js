import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Buscar todos os pagamentos com informações relacionadas
export const getAllPayments = async (req, res) => {
  try {
    let where = {};
    if (req.query.hoje === '1') {
      const start = new Date();
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      where.createdAt = { gte: start, lte: end };
    }
    const payments = await prisma.payment.findMany({
      where,
      include: {
        workOrder: {
          include: {
            vehicle: {
              include: {
                customer: true
              }
            },
            employee: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(payments);
  } catch (error) {
    console.error('Erro ao buscar pagamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar pagamentos.' });
  }
};

// Buscar estatísticas de pagamentos
export const getPaymentStats = async (req, res) => {
  try {
    const { dateFrom, dateTo, method, employeeId } = req.query;

    let where = {};
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59');
    }

    if (method) {
      where.method = method;
    }

    if (employeeId) {
      where.workOrder = {
        employeeId: employeeId
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        workOrder: {
          include: {
            employee: true
          }
        }
      }
    });

    const stats = {
      total: 0,
      count: payments.length,
      byMethod: { pix: 0, cash: 0, debit: 0, credit: 0 },
      byEmployee: {},
      average: 0
    };

    payments.forEach(payment => {
      stats.total += payment.amount;
      stats.byMethod[payment.method] += payment.amount;
      
      const employeeName = payment.workOrder?.employee?.name || 'Sem funcionário';
      stats.byEmployee[employeeName] = (stats.byEmployee[employeeName] || 0) + payment.amount;
    });

    stats.average = stats.count > 0 ? stats.total / stats.count : 0;

    res.status(200).json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro ao buscar estatísticas.' });
  }
}; 