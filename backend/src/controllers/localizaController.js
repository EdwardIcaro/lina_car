import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Obter configuração da Localiza
export const getLocalizaConfig = async (req, res) => {
  try {
    let config = await prisma.localizaConfig.findFirst();
    
    // Se não existe configuração, cria uma padrão
    if (!config) {
      config = await prisma.localizaConfig.create({
        data: {
          name: 'Padrão',
          value: 'default'
        }
      });
    }
    
    res.status(200).json(config);
  } catch (error) {
    console.error('Erro ao buscar configuração da Localiza:', error);
    res.status(500).json({ message: 'Erro ao buscar configuração.' });
  }
};

// Atualizar configuração da Localiza
export const updateLocalizaConfig = async (req, res) => {
  try {
    let config = await prisma.localizaConfig.findFirst();
    const { percentage } = req.body;
    if (config) {
      config = await prisma.localizaConfig.update({
        where: { id: config.id },
        data: { 
          name: 'Padrão', 
          value: 'default',
          percentage: percentage !== undefined ? percentage : config.percentage
        }
      });
    } else {
      config = await prisma.localizaConfig.create({
        data: { name: 'Padrão', value: 'default', percentage: percentage !== undefined ? percentage : 30 }
      });
    }
    res.status(200).json(config);
  } catch (error) {
    console.error('Erro ao atualizar configuração da Localiza:', error);
    res.status(500).json({ message: 'Erro ao atualizar configuração.' });
  }
};

// Obter serviços da Localiza
export const getLocalizaServices = async (req, res) => {
  try {
    const config = await prisma.localizaConfig.findFirst({
      include: {
        services: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!config) {
      return res.status(200).json([]);
    }
    
    res.status(200).json(config.services);
  } catch (error) {
    console.error('Erro ao buscar serviços da Localiza:', error);
    res.status(500).json({ message: 'Erro ao buscar serviços.' });
  }
};

// Criar serviço da Localiza
export const createLocalizaService = async (req, res) => {
  try {
    const { name, price } = req.body;
    
    let config = await prisma.localizaConfig.findFirst();
    
    if (!config) {
      config = await prisma.localizaConfig.create({
        data: {}
      });
    }
    
    const service = await prisma.localizaService.create({
      data: {
        name,
        price: parseFloat(price),
        localizaConfigId: config.id,
      }
    });
    
    res.status(201).json(service);
  } catch (error) {
    console.error('Erro ao criar serviço da Localiza:', error);
    res.status(500).json({ message: 'Erro ao criar serviço.' });
  }
};

// Atualizar serviço da Localiza
export const updateLocalizaService = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    const service = await prisma.localizaService.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        price: price !== undefined ? parseFloat(price) : undefined
      }
    });
    res.status(200).json(service);
  } catch (error) {
    console.error('Erro ao atualizar serviço da Localiza:', error);
    res.status(500).json({ message: 'Erro ao atualizar serviço.' });
  }
};

// Deletar serviço da Localiza
export const deleteLocalizaService = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.localizaService.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar serviço da Localiza:', error);
    res.status(500).json({ message: 'Erro ao deletar serviço.' });
  }
}; 