import { PrismaClient } from '@prisma/client';
import axios from 'axios';
const prisma = new PrismaClient();

// Criar uma nova Ordem de Serviço
export const createOrder = async (req, res) => {
  const { customer, vehicle, serviceIds, employeeId, customService, customPrice, isLocaliza, localizaServiceIds } = req.body;

  try {
    // Se não há telefone, gera um telefone único
    const customerPhone = customer.phone || `CUSTOM_${Date.now()}`;
    
    // Encontra ou cria o cliente pelo telefone
    const customerRecord = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: {},
      create: { name: customer.name, phone: customerPhone },
    });

    let totalPrice = 0;
    let vehicleRecord = null;
    let employeePercentage = null;

    // Determina a porcentagem de ganho do funcionário
    if (employeeId) {
      const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
      if (employee) {
        if (isLocaliza) {
          // Para serviços da Localiza, usa a porcentagem da configuração da Localiza
          const localizaConfig = await prisma.localizaConfig.findFirst();
          employeePercentage = localizaConfig?.percentage || 30.0;
        } else {
          // Para serviços normais, usa a porcentagem do funcionário
          employeePercentage = employee.percentage;
        }
      }
    }

    if (customService && customPrice) {
      // Serviço customizado - criar veículo fictício
      vehicleRecord = await prisma.vehicle.upsert({
        where: { plate: `CUSTOM_${Date.now()}` },
        update: {},
        create: {
          plate: `CUSTOM_${Date.now()}`,
          make: 'Serviço Customizado',
          model: customService,
          color: 'N/A',
          customerId: customerRecord.id,
        },
      });
      totalPrice = customPrice;
    } else {
      // Serviço normal
      // Se não há placa, gera uma placa única
      const vehiclePlate = vehicle.plate || `CUSTOM_${Date.now()}`;

    // Encontra ou cria o veículo pela placa
      const makeValue = vehicle.make || 'Desconhecido';
      vehicleRecord = await prisma.vehicle.upsert({
        where: { plate: vehiclePlate },
      update: {},
      create: {
          plate: vehiclePlate,
          make: makeValue,
        model: vehicle.model,
          color: vehicle.color || 'Não informado',
        customerId: customerRecord.id,
      },
    });

      // Calcula o preço total dos serviços
      if (isLocaliza && localizaServiceIds && localizaServiceIds.length > 0) {
        // Serviços da Localiza
        const localizaServices = await prisma.localizaService.findMany({ 
          where: { id: { in: localizaServiceIds } } 
        });
        totalPrice = localizaServices.reduce((sum, service) => sum + service.price, 0);
      } else {
        // Serviços normais
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
        totalPrice = services.reduce((sum, service) => sum + service.price, 0);
      }
    }

    // Cria a Ordem de Serviço
    const newOrder = await prisma.workOrder.create({
      data: {
        vehicle: vehicleRecord ? { connect: { id: vehicleRecord.id } } : undefined,
        totalPrice: totalPrice,
        employee: employeeId ? { connect: { id: employeeId } } : undefined,
        employeePercentage: employeePercentage,
        customService: customService || null,
        isLocaliza: isLocaliza || false,
        services: customService ? {
          create: [] // Sem serviços padrão para customizados
        } : isLocaliza && localizaServiceIds ? {
          create: [] // Serviços da Localiza não usam a tabela de relacionamento normal
        } : {
          create: serviceIds.map(id => ({
            service: { connect: { id } },
          })),
        },
      },
      include: {
        vehicle: { include: { customer: true } },
        services: { include: { service: true } },
        employee: true,
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Erro ao criar ordem:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};

// Obter Ordens de Serviço para o Dashboard (não finalizadas)
export const getDashboardOrders = async (req, res) => {
    try {
        // Primeiro, vamos verificar se há ordens com dados inconsistentes
        const allOrders = await prisma.workOrder.findMany({
            where: {
                status: {
                    in: ['AWAITING', 'WASHING', 'READY']
                }
            },
            include: {
                vehicle: { include: { customer: true } },
                services: { include: { service: true } },
                employee: true,
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        
        // Filtra ordens com dados válidos
        const validOrders = allOrders.filter(order => {
            // Verifica se a ordem tem dados básicos válidos
            if (!order.id || !order.status) {
                console.warn(`Ordem com dados inválidos encontrada: ${order.id}`);
                return false;
            }
            
            // Para ordens customizadas, não precisa de vehicle
            if (order.customService) {
                return true;
            }
            
            // Para ordens normais, verifica se tem vehicle válido
            if (!order.vehicle) {
                console.warn(`Ordem ${order.id} sem vehicle associado`);
                return false;
            }
            
            return true;
        });
        
        res.status(200).json(validOrders);
    } catch (error) {
        console.error('Erro detalhado ao buscar ordens do dashboard:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            message: "Erro ao buscar ordens.",
            error: error.message
        });
    }
}

// Atualizar status de uma Ordem de Serviço
export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, payments } = req.body;
    try {
        const updateData = { status };
        
        // Se o status for FINISHED, define a data de finalização
        if (status === 'FINISHED') {
            updateData.finishedAt = new Date();
        }
        
        const updatedOrder = await prisma.workOrder.update({
            where: { id },
            data: updateData,
        });

        // Se há pagamentos e o status é FINISHED, salva os pagamentos
        if (status === 'FINISHED' && payments && Array.isArray(payments)) {
            await prisma.payment.createMany({
                data: payments.map(payment => ({
                    workOrderId: id,
                    method: payment.method,
                    amount: payment.amount,
                    received: payment.received || null,
                    change: payment.change || null
                }))
            });
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ message: "Erro ao atualizar status." });
    }
} 

// Consulta de veículo por placa (mock)
export const getVehicleByPlate = async (req, res) => {
  const plate = req.params.plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  try {
    const { data } = await axios.get(`https://brasilapi.com.br/api/placa/v1/${plate}`);
    res.json({ make: data.marca, model: data.modelo });
  } catch (err) {
    res.status(404).json({ message: 'Veículo não encontrado.' });
  }
};

// Nova função para listar ordens, com filtro por employeeId
export const listOrders = async (req, res) => {
  const { employeeId, finalizadasHoje } = req.query;
  try {
    let where = {};
    if (employeeId) where.employeeId = employeeId;
    if (finalizadasHoje === '1') {
      const start = new Date();
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      where.finishedAt = { gte: start, lte: end };
      where.status = 'FINISHED';
    }
    const orders = await prisma.workOrder.findMany({
      where,
      include: {
        vehicle: true,
        employee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordens.' });
  }
};

// Deletar uma Ordem de Serviço
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.workOrder.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar ordem:', error);
    res.status(500).json({ message: 'Erro ao deletar ordem.', error: error.message });
  }
};

// Buscar todas as ordens com informações completas
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.workOrder.findMany({
      include: {
        vehicle: { 
          include: { 
            customer: true 
          } 
        },
        services: { 
          include: { 
            service: true 
          } 
        },
        employee: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Erro ao buscar ordens:', error);
    res.status(500).json({ message: 'Erro ao buscar ordens.' });
  }
}; 