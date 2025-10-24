-- Script para criar banco de dados EasyControl
-- Execute este script no FreeSQLDatabase

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de supervisor
CREATE TABLE IF NOT EXISTS supervisor (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de histórico de agendamentos
CREATE TABLE IF NOT EXISTS historico_agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    data DATE NOT NULL,
    horario VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuários iniciais
INSERT IGNORE INTO usuarios (usuario, senha, email) VALUES 
('admin', '123', 'admin@teste.com'),
('user1', '123', 'user1@teste.com'),
('petrus', '123', 'petrus@teste.com');

-- Inserir supervisor inicial
INSERT IGNORE INTO supervisor (usuario, senha, email) VALUES 
('supervisor', 'admin123', 'supervisor@teste.com');

-- Verificar se as tabelas foram criadas
SELECT 'Tabelas criadas com sucesso!' as status;