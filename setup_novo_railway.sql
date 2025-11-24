-- Script completo para recriar todas as tabelas no novo banco Railway
-- Execute este script no novo banco de dados

-- 1. Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar tabela de supervisor
CREATE TABLE IF NOT EXISTS supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data VARCHAR(10) NOT NULL,
    horario VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar tabela de histórico de agendamentos
CREATE TABLE IF NOT EXISTS historico_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    data DATE NOT NULL,
    horario ENUM('manha', 'tarde', 'noite') NOT NULL,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Criar tabela de scans
CREATE TABLE IF NOT EXISTS scans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    turno ENUM('manha', 'tarde', 'noite'),
    tipo_scan ENUM('inicio', 'fim') NOT NULL,
    resultado_scan TEXT NOT NULL
);

-- 6. Adicionar constraint única para agendamentos
ALTER TABLE agendamentos 
ADD CONSTRAINT unique_data_horario 
UNIQUE (data, horario);

-- 7. Inserir dados iniciais - usuários
INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
('admin', '123', 'admin@teste.com'),
('user1', '123', 'user1@teste.com'),
('petrus', '123', 'petrus@teste.com');

-- 8. Inserir dados iniciais - supervisor
INSERT IGNORE INTO supervisor (usuario, senha, nome) VALUES 
('admin', 'admin123', 'Administrador'),
('supervisor', 'super123', 'Supervisor');

-- Verificar se as tabelas foram criadas
SELECT 'Todas as tabelas foram criadas com sucesso no novo Railway!' as status;