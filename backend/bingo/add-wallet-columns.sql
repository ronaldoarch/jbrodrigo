-- Adicionar colunas faltantes na tabela wallets
-- Este script pode ser executado via terminal ou HTTP

-- Verificar e adicionar total_wagered
ALTER TABLE `wallets` 
ADD COLUMN IF NOT EXISTS `total_wagered` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_withdrawn`;

-- Verificar e adicionar total_won (caso não exista)
ALTER TABLE `wallets` 
ADD COLUMN IF NOT EXISTS `total_won` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_wagered`;

-- Verificar e adicionar outras colunas que podem estar faltando
ALTER TABLE `wallets` 
ADD COLUMN IF NOT EXISTS `locked_balance` DECIMAL(12,2) DEFAULT 0.00 AFTER `bonus_balance`,
ADD COLUMN IF NOT EXISTS `total_deposited` DECIMAL(12,2) DEFAULT 0.00 AFTER `locked_balance`,
ADD COLUMN IF NOT EXISTS `total_withdrawn` DECIMAL(12,2) DEFAULT 0.00 AFTER `total_deposited`;

