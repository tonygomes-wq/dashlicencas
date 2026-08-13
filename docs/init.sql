-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 23/04/2026 às 12:24
-- Versão do servidor: 5.7.44-48
-- Versão do PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `faceso56_dashlicencas`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `bitdefender_api_config`
--

CREATE TABLE `bitdefender_api_config` (
  `id` int(11) NOT NULL DEFAULT '1',
  `api_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'API Key do Bitdefender GravityZone',
  `access_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'URL de acesso da API',
  `enabled` tinyint(1) DEFAULT '0' COMMENT 'Ativar/desativar sincronização',
  `sync_interval` int(11) DEFAULT '3600' COMMENT 'Intervalo entre sincronizações em segundos',
  `last_sync` timestamp NULL DEFAULT NULL COMMENT 'Última sincronização bem-sucedida',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `bitdefender_licenses`
--

CREATE TABLE `bitdefender_licenses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `company` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `contact_person` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `expiration_date` date DEFAULT NULL,
  `total_licenses` int(11) DEFAULT NULL,
  `license_key` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client_api_key` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'API Key específica do cliente',
  `client_access_url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT 'Access URL específica do cliente',
  `last_sync` timestamp NULL DEFAULT NULL COMMENT 'Última sincronização deste cliente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `renewal_status` varchar(50) COLLATE utf8_unicode_ci DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `bitdefender_licenses`
--

INSERT INTO `bitdefender_licenses` (`id`, `user_id`, `company`, `contact_person`, `email`, `expiration_date`, `total_licenses`, `license_key`, `client_api_key`, `client_access_url`, `last_sync`, `created_at`, `renewal_status`) VALUES
(1, 1, 'ACIL', 'MARCELO', 'lbarros@acil.com.br', '0000-00-00', 0, 'Q3VY4T4 - C2E7ZJI', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(2, 1, 'AFIPLAN', 'MARCELO', 'marcelo@afiplan.com.br', '2026-06-14', 22, ' P6UQAYBR76MB- Usuários: 10 - 12 MESES', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(3, 1, 'AGROPLAY', 'VALDIR', 'antivirusboiadeira@gmail.com', '2027-05-25', 60, 'YQY2AB8SQ89W - NQ2ZD37485KQ', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(4, 1, 'AMARAL VASCONCELLOS', 'GISELE', 'webmaster@pedrialivasconcellos.com.br', '2026-09-28', 150, 'Licença: YX55KZF- Usuários: 150 - Meses: 24 (ATIVA) Licença: L0CB4HK- Usuários: 150 - Meses: 24', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(5, 1, 'CARAGA PESADA', 'ISABELA', 'antiviruscargapesada@gmail.com', '2027-11-15', 20, 'F2XZCPV43W6P', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(6, 1, 'COCRIAGRO', 'TATIANA', 'antiviruscocriagro@gmail.com', '2025-07-18', 5, 'Licença:  WQLJTZRHLD29 - 12 MESES (EXPIRADA) - Usuário: 5', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Pendente'),
(7, 1, 'COMPERFORT ART. MOVELEIROS', 'KAMILA', 'compenfort@sercomtel.com.br', '2026-08-18', 31, 'GHMHMXZ - 31 CHAVES - MESES 36(ATIVO ) - ZSVLYJ  Usuário:  31 12 meses(usada)', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(8, 1, 'CONSULTOMAQ', 'RODRIGO', 'antivirusconsultomaq@gmail.com', '2026-10-14', 220, 'J4QBP5KNSNBZ', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Renovado'),
(9, 1, 'CRIART', 'Não informado', 'antiviruscriart@gmail.com', '2020-11-28', 7, 'U5TBF0D', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Pendente'),
(10, 1, 'DAMIÃO CONTABILIDADE', 'DANIEL', 'damiaocontabilidade@gmail.com', '2021-12-16', 14, 'WDUM2EU- Usuários: 14 - Meses: 12 (ATIVO) - CCS03N7- Usuários: 14 - Meses: 36', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Pendente'),
(11, 1, 'DESENVOL SISTEMAS', 'LEANDRO', 'leandro@desenvol.com.br', '2022-12-12', 25, 'GEAELT2 (chave de 36 meses) - (ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:45', 'Pendente'),
(12, 1, 'DIALLI DISTRIBUIDORA', 'ADRIANO', 'infra.ti@dialli.com.br', '2027-04-27', 105, '42FHLVQZKJPD CAHVE 12 MESES  - 3SZSMUGELM6Q CHAVE 36 MESES ATIVA', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(13, 1, 'DISMAFE FERRAMENTAS', 'THAIS', 'antivirusdismafe@gmail.com', '2025-11-24', 0, ' ativo   - BJF6RHM ( Chave 36 meses )', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(14, 1, 'EAGLEFLEX', 'BRUNO', 'amarildo@interseals.com.br', '2028-11-06', 35, 'THRKNNKM5X3F', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(15, 1, 'FOCUS INTELIGENCIA', 'MARCOS', 'marco@focusinteligencia.com.br', '2028-01-20', 8, 'FWR8T9QRJS6D', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(16, 1, 'GNB BATERIAS', 'DINO', 'licenciamento@gnbbaterias.com.br', '2025-08-17', 55, '0ZHQ7WU - Usuários: 55 - Meses: 36 (ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(17, 1, 'GRUPO HP', 'JUNIOR', 'antivirusgrupohp@gmail.com', '2027-04-20', 24, 'ZRZM6KTVVC3R', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(18, 1, 'HIDROMAR', 'MARGARETH', 'margareth@hidromar.com.br', '2026-10-07', 51, 'CDJ9U6EN5DZK ( chave 12 meses ) ATIVO  - HV7E9T3PG382 (chave de 36 meses) ', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(19, 1, 'SUPERMERCADO SANTAREM', 'ELEN', 'antivirussantarem@gmail.com', '2027-04-24', 102, '4N6VEHGXZHC6 CHAVE 12 MESES ATIVA - MKBNQ3CUNB9L CHAVE 36 MESES\r\n', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(20, 1, 'HYDRONLUBZ', 'JORGE', 'jorge@hydronlubz.com.br', '2027-05-10', 55, 'L4GRRNGDA83C- Usuários: 55 - Meses: 12 - F5ELJF54SNF8 - Usuarios: 55 - Meses: 36 ( ativo)', 'd6a419c2474b913fa45671c00f3cc0afa1d74be95b0ead5e7a9bacacde0bbe10', 'https://cloud.gravityzone.bitdefender.com/api', NULL, '2025-12-19 15:03:46', 'Renovado'),
(21, 1, 'IMOBILIARIA NATAL', 'VILSON', '                  imonatal@sercomtel.com.br', '2024-10-31', 0, 'RGA34KZ - USUARIOS 15 - ATIVO ( UTILIZADA A SEGUNDA CHAVE )', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(22, 1, 'LABORSOLO', 'LEANDRO', 'ti@laborsolo.com.br', '2027-04-21', 75, 'Y4HDDXE4BRH5 12 meses (ativo) - Usuarios: 65 - Meses:36 - 9F8KZHA7NN7P  ', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(23, 1, 'MAC-IP TECNOLOGIA', 'RONALDO COUZA ', 'bitdefender@macip.com.br', '2026-11-15', 25, '7NTNLLRWJBR9 - 12 Meses', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(24, 1, 'MACRIPAR', 'CRISTIANE', 'financeiro@macripar.com.br', '2026-01-11', 20, 'MQYE6W3MRTNW', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(25, 1, 'MAGLON MOTOSSERRAS', 'PAULA', 'maglonmotoserras@sercomtel.com.br', '2029-03-25', 5, 'VHGXYWFVYGCD - Usuários: 11 - Meses: 36 - (ATIVO)', '57352e3e96f2e7bd07930d3a9a788e93e2b79d0c2bfe58e0bc352467ea748e2b', 'https://cloud.gravityzone.bitdefender.com/api', NULL, '2025-12-19 15:03:46', 'Renovado'),
(26, 1, 'MAPA CONSULTORIA', 'FILIPE', 'antivirusmapa@gmail.com', '2028-10-12', 12, 'K76YBWD8WBNY 36 MESES', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(27, 1, 'MEGA JEANS', 'RAFAEL', 'antivirusmegajeans@gmail.com', '2023-10-20', 50, 'LNLEXM2 -  Usuários: 10 - Meses: 36 EXPIRADO) - Expirou\r\nSTG66LAF3TYB - Usuário: 50', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(28, 1, 'MOTTA E FARIAS ADVOCACIA', 'Não informado', 'antivirusalifrancy@gmail.com', '2025-06-20', 50, 'M8XDB8S8BB9U', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(29, 1, 'NUTRIBRAS', 'VANIA', 'nutribras@nutribras.com.br', '2027-08-06', 25, '44WDJXCGZYBJ- Usuários: 25 - Meses: 24 ( EXPIRADO ) - 6PEWSKPQULLH- Usuários: 25 - Meses: 24(ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(30, 1, 'NUTRIDANI', 'RAFAEL', 'rafael@nutridani.com.br', '2026-10-04', 25, 'RIPEB3L- Usuários: 25 - Meses: 12 - CHAVE 36 MESES 2SKDIWQ ( Ativo )', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(31, 1, 'PEGORARO', 'GUILHERME', 'antiviruspegoraro@gmail.com', '2028-11-16', 51, 'JZ7DLSJP3UQ4 - 36 MESES', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(32, 1, 'POZZER TRANSPORTES', 'MARCIO', 'marcio@pozzertransportes.com.br', '2026-04-16', 20, 'L4CMSC5 (chave de 12)  -  IVMLBP4 (Chave de 36 meses ativada) ', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(33, 1, 'REBOUÇAS', 'ALISSON', 'antivirusreboucas@gmail.com', '2026-10-24', 30, 'B4HW5HB', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(34, 1, 'ROMANELLI', 'FELIPE', 'antivirusromanelli@gmail.com', '0000-00-00', 0, 'Não informado', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(35, 1, 'ROMANINI', 'JENIFER', 'contato@romanini.com.br', '2026-08-20', 20, '6TLXYWN (chave de 12 meses) - DZFA365 ( Chave de 36 meses ) (EXPIRADO)  IVMLBP4(xx MESES) - Usuários: 20', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(36, 1, 'ROYAL PLAZA SHOPPING', 'MARTA', 'adm@royalplazashopping.com.br', '2026-02-25', 14, '5CEQ4GY ( Chave de 36 meses ) (ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(37, 1, 'SCHIAVON', 'ISABELA', 'isabela@gruposm.ind.br', '2026-08-13', 45, 'MNBCS50- Usuários: 45 - Meses: 12  - DUWZBXD - Usuarios: 45 -  Meses:36 ( Ativo )', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(38, 1, 'SERRA CONTABILIDADE', 'MARCOS', 'marcos@serracontabil.com.br', '2025-01-22', 7, 'QFD7DLXLTK9C (chave de 12 meses ) - (EXPIRADO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(39, 1, 'SINDICATO DAS INDUSTRIAS METALURGICAS', 'ANDREIA', 'atendimento@sindimetalnortepr.com.br', '2028-08-23', 0, 'Chave: 2HXYCTS37MEV(12 meses)   Chave: BQUE4VMKZJPX ( 36 meses) (ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(40, 1, 'SISTEMICA\\CONTINUA LOGISTICA', 'JULIETE', 'juliete.evaristo@continualogistica.com.br', '2023-04-19', 25, '75G6A6C- Usuários: 25 - Meses: 36 - (ATIVO)', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente'),
(41, 1, 'SOCIEDADE RUAL DO PARANA', 'SUZA', 'superintendencia@srp.com.br', '2028-10-08', 20, '9YPW8VR7Q7T2', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(42, 1, 'TR DISTRIBUIDORA EPIS', 'DAILTON', 'antivirustrequipamentos@gmail.com', '2026-08-23', 35, '98NDN37NFYQR', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Renovado'),
(43, 1, 'VIA GRAFIT', 'DOUGLAS', 'alexandre@viagrafit.com.br', '2025-06-26', 44, 'Licença:- Usuários: 44 - (EXPIROU) - 36MESES ( 8GEXGQ3MHQB5 )', NULL, NULL, NULL, '2025-12-19 15:03:46', 'Pendente');

-- --------------------------------------------------------

--
-- Estrutura para tabela `bitdefender_sync_log`
--

CREATE TABLE `bitdefender_sync_log` (
  `id` int(11) NOT NULL,
  `status` enum('success','error','warning') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` json DEFAULT NULL COMMENT 'Detalhes adicionais em formato JSON',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `bitdefender_sync_log`
--

INSERT INTO `bitdefender_sync_log` (`id`, `status`, `message`, `details`, `created_at`) VALUES
(1, 'error', 'Cliente ID 25: Erro cURL: Connection timed out after 30000 milliseconds', '{\"error\": \"Erro cURL: Connection timed out after 30000 milliseconds\", \"request\": {\"url\": \"https://cloud.gravityzone.bitdefender.com/api\", \"company\": \"MAGLON MOTOSSERRAS\", \"client_id\": 25}, \"client_id\": 25}', '2026-04-23 16:57:54');

-- --------------------------------------------------------

--
-- Estrutura para tabela `email_history`
--

CREATE TABLE `email_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `recipient_email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `body_preview` text COLLATE utf8_unicode_ci,
  `product_type` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `item_id` int(11) NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `fortigate_devices`
--

CREATE TABLE `fortigate_devices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `serial` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `model` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `client` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `vencimento` date DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `renewal_status` varchar(50) COLLATE utf8_unicode_ci DEFAULT 'Pendente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `fortigate_devices`
--

INSERT INTO `fortigate_devices` (`id`, `user_id`, `serial`, `model`, `client`, `vencimento`, `registration_date`, `created_at`, `email`, `renewal_status`) VALUES
(1, 1, 'FGT40FTK21005916', 'FortiGate 40F', 'PEGORARO', '2026-09-20', '2021-10-03', '2025-12-19 15:03:46', '', 'Renovado'),
(2, 1, 'FGT40FTK21024027', 'FortiGate 40F', ' ULTRAMEDICALDEVICES', '2022-10-03', '2021-10-12', '2025-12-19 15:03:46', '', 'Pendente'),
(3, 1, 'FGT40FTK21055493', 'FortiGate 40F', 'xxxx', '2022-10-23', '2021-10-23', '2025-12-19 15:03:46', '', 'Pendente'),
(4, 1, 'FGT40FTK2109ATFD', 'FortiGate 40F', 'REBOUÇAS', '2026-05-25', '2022-08-23', '2025-12-19 15:03:46', '', 'Renovado'),
(5, 1, 'FGT40FTK22099TW2', 'FortiGate 40F', 'IMO_SERVICOS_CORREIO', '2023-11-11', '2023-03-29', '2025-12-19 15:03:46', '', 'Pendente'),
(6, 1, 'FGT40FTK2209AQUL', 'FortiGate 40F', 'DIALLI-CASCAVEL', '2026-05-28', '2023-05-29', '2025-12-19 15:03:46', '', 'Renovado'),
(7, 1, 'FGT40FTK2209BT6K', 'FortiGate 40F', 'ROMANELI', '2026-05-25', '2023-02-22', '2025-12-19 15:03:46', '', 'Renovado'),
(8, 1, 'FGT40FTK2209CBYF', 'FortiGate 40F', 'AGROPLAY', '2026-11-18', '2023-08-30', '2025-12-19 15:03:46', '', 'Renovado'),
(9, 1, 'FGT40FTK2209CC82', 'FortiGate 40F', 'ROMANINI ', '2024-11-05', '2023-02-10', '2025-12-19 15:03:46', '', 'Pendente'),
(10, 1, 'FGT40FTK2209CKBV', 'FortiGate 40F', 'HIDROMAR', '2024-09-24', '2023-08-30', '2025-12-19 15:03:46', '', 'Pendente'),
(11, 1, 'FGT40FTK23089195', 'FortiGate 40F', 'N3', '2025-04-21', '2024-01-31', '2025-12-19 15:03:46', '', 'Pendente'),
(12, 1, 'FGT40FTK23099ZKQ', 'FortiGate 40F', 'xxxx', '2026-02-26', '2025-03-25', '2025-12-19 15:03:46', '', 'Renovado'),
(13, 1, 'FGT40FTK2309A8PY', 'FortiGate 40F', 'SCHIAVON-LAVANDERIA', '2025-10-23', '2024-11-18', '2025-12-19 15:03:46', '', 'Pendente'),
(14, 1, 'FGT40FTK2309ABLL', 'FortiGate 40F', 'CARGA PESADA', '2025-09-25', '2024-09-25', '2025-12-19 15:03:46', '', 'Pendente'),
(15, 1, 'FGT40FTK2309ACLA', 'FortiGate 40F', 'SCHIAVON-CUIABA', '2025-11-12', '2024-11-18', '2025-12-19 15:03:46', '', 'Pendente'),
(16, 1, 'FGT40FTK2309ACNP', 'FortiGate 40F', 'FIEL', '2025-10-09', '2024-09-25', '2025-12-19 15:03:46', '', 'Pendente'),
(17, 1, 'FGT40FTK2309AG2K', 'FortiGate 40F', 'EAGLEFLEX-FABRICA', '2024-12-25', '2023-12-26', '2025-12-19 15:03:46', '', 'Pendente'),
(18, 1, 'FGT40FTK2309AG41', 'FortiGate 40F', 'BOTELHO-HOTEL', '2024-12-20', '2023-12-21', '2025-12-19 15:03:46', '', 'Pendente'),
(19, 1, 'FGT40FTK2309AGY9', 'FortiGate 40F', 'EAGLEFLEX-ADM', '2024-12-21', '2023-12-18', '2025-12-19 15:03:46', '', 'Pendente'),
(20, 1, 'FGT40FTK2309AHWF', 'FortiGate 40F', 'CDC-ADM ', '2024-12-26', '2023-12-29', '2025-12-19 15:03:46', '', 'Pendente'),
(21, 1, 'FGT40FTK2309AHWG', 'FortiGate 40F', 'VIAGRAFIT', '2026-01-21', '2023-12-29', '2025-12-19 15:03:46', '', 'Renovado'),
(22, 1, 'FGT40FTK2309AJ7D', 'FortiGate 40F', 'NUTRIBRAS', '2024-12-20', '2023-12-21', '2025-12-19 15:03:46', '', 'Pendente'),
(23, 1, 'FGT60FTK21060566', 'FortiGate 60F', 'AMARAL VASCONCELLOS', '2026-09-20', '2021-11-27', '2025-12-19 15:03:46', '', 'Renovado'),
(24, 1, 'FGT60FTK22049527', 'FortiGate 60F', 'HYDRONLUBZ', '2024-02-06', '2023-02-03', '2025-12-19 15:03:46', '', 'Pendente'),
(25, 1, 'FGT60FTK22050162', 'FortiGate 60F', 'ALO', '2024-03-12', '2023-01-27', '2025-12-19 15:03:46', '', 'Pendente'),
(26, 1, 'FGT60FTK2209GPQP', 'FortiGate 60F', 'CDC MATRIZ', '2024-12-18', '2023-12-18', '2025-12-19 15:03:46', '', 'Pendente'),
(27, 1, 'FGT60FTK2209GQKS', 'FortiGate 60F', 'NUTRIDANI', '2024-05-21', '2024-01-16', '2025-12-19 15:03:46', '', 'Pendente'),
(28, 1, 'FGT60FTK2209HM2E', 'FortiGate 60F', 'DIALLI-MATRIZ', '2026-05-28', '2023-05-27', '2025-12-19 15:03:46', '', 'Renovado'),
(29, 1, 'FGT60FTK23060398', 'FortiGate 60F', 'COMPENFORT', '2025-09-26', '2024-09-26', '2025-12-19 15:03:46', '', 'Pendente'),
(30, 1, 'FGT60FTK23071890', 'FortiGate 60F', 'SUPREMA DENTAL', '2025-06-24', '2024-06-24', '2025-12-19 15:03:46', '', 'Pendente'),
(31, 1, 'FGT60FTK2309AZ8M', 'FortiGate 60F', 'xxxx', '2026-02-26', '2025-04-24', '2025-12-19 15:03:46', '', 'Renovado'),
(32, 1, 'FGT60FTK2309AZC9', 'FortiGate 60F', 'xxxx', '2025-12-05', '2024-12-05', '2025-12-19 15:03:46', '', 'Pendente');

-- --------------------------------------------------------

--
-- Estrutura para tabela `gmail_clients`
--

CREATE TABLE `gmail_clients` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `gmail_clients`
--

INSERT INTO `gmail_clients` (`id`, `user_id`, `client_name`, `contact_email`, `created_at`) VALUES
('029f526e26accb9ea987337965b545ff', 1, 'Agroplay', 'suporte@agroplaymusic.com.br', '2026-01-05 19:37:02'),
('e101ff0baa4ed9b9a807bfa41865d809', 1, 'Eagleflex - Interseals', 'interseals@interseals.com.br', '2026-01-05 17:02:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `gmail_licenses`
--

CREATE TABLE `gmail_licenses` (
  `id` int(11) NOT NULL,
  `client_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `license_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `renewal_status` varchar(50) COLLATE utf8_unicode_ci DEFAULT 'Pendente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `gmail_licenses`
--

INSERT INTO `gmail_licenses` (`id`, `client_id`, `user_id`, `username`, `email`, `password`, `license_type`, `renewal_status`, `created_at`) VALUES
(2, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'estagio.administrativo@interseals.com.br', 'estagio.administrativo@interseals.com.br', 'Eagleflex230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(3, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'quinteiro@interseals.com.br', 'quinteiro@interseals.com.br', 'Interseals230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(4, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'adriana@interseals.com.br', 'adriana@interseals.com.br', '@eagleFlex230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(5, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'claudia@interseals.com.br', 'claudia@interseals.com.br', 'definida por ela', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(6, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'carlos@interseals.com.br', 'carlos@interseals.com.br', 'definido por ele', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(8, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'ires@interseals.com.br', 'ires@interseals.com.br', NULL, 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(9, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'nfe@interseals.com.br', 'nfe@interseals.com.br', '@InterSeals284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(10, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'faturamento@interseals.com.br', 'faturamento@interseals.com.br', '@interSeals284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(11, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'interseals@interseals.com.br', 'interseals@interseals.com.br', '@Eagleflex230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(12, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'suprimentos1@interseals.com.br', 'suprimentos1@interseals.com.br', 'Interseals400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(13, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'qualidade@interseals.com.br', 'qualidade@interseals.com.br', 'Interseals400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(14, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'administrativo@interseals.com.br', 'administrativo@interseals.com.br', 'Interseals400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(15, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'angelica@interseals.com.br', 'angelica@interseals.com.br', '@interSeals284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(16, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'eng2@interseals.com.br', 'eng2@interseals.com.br', '@interSeais284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(17, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'pcp1@eagleflex.com.br', 'pcp1@eagleflex.com.br', '@eagleflex230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(18, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'murillo@interseals.com.br', 'murillo@interseals.com.br', '@interSeals284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(19, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'administrativo1@interseals.com.br', 'administrativo1@interseals.com.br', 'Eagleflex230@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(20, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'filialpe@eagleflex.com.br', 'filialpe@eagleflex.com.br', 'Eagleflex400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(21, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'eaglefilialpe@gmail.com', 'eaglefilialpe@gmail.com', 'Eagleflex400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(22, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'filialpe2@eagleflex.com.br', 'filialpe2@eagleflex.com.br', 'Eagleflex400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(23, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'eaglevendas2@gmail.com', 'eaglevendas2@gmail.com', 'Eagleflex400@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(24, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'almox1@interseals.com.br', 'almox1@interseals.com.br', '@interSeals284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(25, 'e101ff0baa4ed9b9a807bfa41865d809', 1, 'caixa@internationalseals.com.br', 'caixa@internationalseals.com.br', 'Guapore284@', 'Locaweb', 'Pendente', '2026-01-05 17:03:48'),
(26, '029f526e26accb9ea987337965b545ff', 1, 'Macip', 'suporte@agroplaymusic.com.br', '##agr@1.2##', 'Google', 'Pendente', '2026-01-05 19:37:02'),
(27, '029f526e26accb9ea987337965b545ff', 1, 'Caio Coelho', 'adm_records@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(28, '029f526e26accb9ea987337965b545ff', 1, 'agenda agroplay music', 'agenda@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(29, '029f526e26accb9ea987337965b545ff', 1, 'agroplay kids', 'agroplaykids@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(30, '029f526e26accb9ea987337965b545ff', 1, 'Everton Albertoni, AgroPlay', 'albertoni@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(31, '029f526e26accb9ea987337965b545ff', 1, 'Ana Castela - Agroplay Music', 'anacastela@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(32, '029f526e26accb9ea987337965b545ff', 1, 'backups agroplay', 'backups@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(33, '029f526e26accb9ea987337965b545ff', 1, 'Borges - Agro Play Music', 'borges@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(34, '029f526e26accb9ea987337965b545ff', 1, 'Bruno Sugayama', 'bruno.sugayama@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(35, '029f526e26accb9ea987337965b545ff', 1, 'Camilla Mendes', 'camilla.mendes@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(36, '029f526e26accb9ea987337965b545ff', 1, 'Central Ana Castela', 'centralanacastela@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(37, '029f526e26accb9ea987337965b545ff', 1, 'central leoeraphael', 'centralleoeraphael@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(38, '029f526e26accb9ea987337965b545ff', 1, 'Chico - Agroplay Music', 'chico@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(39, '029f526e26accb9ea987337965b545ff', 1, 'Compras Agroplay', 'compras@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(40, '029f526e26accb9ea987337965b545ff', 1, 'contabilidade agroplay', 'contabilidade@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(41, '029f526e26accb9ea987337965b545ff', 1, 'contato agroplay music', 'contato@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(42, '029f526e26accb9ea987337965b545ff', 1, 'Contratos2 Agroplay Music', 'contratos2@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(43, '029f526e26accb9ea987337965b545ff', 1, 'Contrato Agro Play Music', 'contratos3@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(44, '029f526e26accb9ea987337965b545ff', 1, 'Contratos Agroplay', 'contratos@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(45, '029f526e26accb9ea987337965b545ff', 1, 'controladoria2 agroplay', 'controladoria2@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(46, '029f526e26accb9ea987337965b545ff', 1, 'Controladoria - Agroplay Music', 'controladoria@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(47, '029f526e26accb9ea987337965b545ff', 1, 'cto Fabio', 'cto@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(48, '029f526e26accb9ea987337965b545ff', 1, 'David Jonatas', 'david.jonatas@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(49, '029f526e26accb9ea987337965b545ff', 1, 'Edição Agroplay', 'edicao@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(50, '029f526e26accb9ea987337965b545ff', 1, 'Edir Agroplay', 'edir@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(51, '029f526e26accb9ea987337965b545ff', 1, 'Elizeu Pereti', 'elizeu.pereti@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(52, '029f526e26accb9ea987337965b545ff', 1, 'Emiliana Possobon', 'emiliana.possobon@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(53, '029f526e26accb9ea987337965b545ff', 1, 'Fabio Machado', 'fabio.machado@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(54, '029f526e26accb9ea987337965b545ff', 1, 'Fabio Rojas', 'fabio.rojas@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(55, '029f526e26accb9ea987337965b545ff', 1, 'Falco Falco', 'falco@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(56, '029f526e26accb9ea987337965b545ff', 1, 'Filipe Eberhard, Agroplay', 'filipe@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(57, '029f526e26accb9ea987337965b545ff', 1, 'Financeiro Agroplay', 'financeiro@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(58, '029f526e26accb9ea987337965b545ff', 1, 'DepartamentoFiscal DepartamentoFiscal', 'fiscal@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(59, '029f526e26accb9ea987337965b545ff', 1, 'Francisco - Agroplay Music', 'francisco@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(60, '029f526e26accb9ea987337965b545ff', 1, 'Guilherme e Manuel - Agroplay Music', 'guilhermeemanuel@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(61, '029f526e26accb9ea987337965b545ff', 1, 'Isabella Soncela', 'isabella.soncela@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(62, '029f526e26accb9ea987337965b545ff', 1, 'Izadora Bernardi', 'izadora.bernardi@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(63, '029f526e26accb9ea987337965b545ff', 1, 'jc.ler agroplay', 'jc.ler@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(64, '029f526e26accb9ea987337965b545ff', 1, 'Jean Carlos', 'jeancarlos@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(65, '029f526e26accb9ea987337965b545ff', 1, 'Gerente Projetos', 'joao.marinho@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(66, '029f526e26accb9ea987337965b545ff', 1, 'Júlia Jurídico', 'julia_juridico@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(67, '029f526e26accb9ea987337965b545ff', 1, 'Julia e Rafaela - Agroplay', 'juliaerafaela@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(68, '029f526e26accb9ea987337965b545ff', 1, 'Julya e Maryana - Agroplay Music', 'julyaemaryana@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(69, '029f526e26accb9ea987337965b545ff', 1, 'juridico juridico', 'juridico@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(70, '029f526e26accb9ea987337965b545ff', 1, 'Kids Agroplay Music', 'kids@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(71, '029f526e26accb9ea987337965b545ff', 1, 'Leo e Raphael Agroplay', 'leoeraphael@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(72, '029f526e26accb9ea987337965b545ff', 1, 'Leticia Rossato', 'leticia.rossato@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(73, '029f526e26accb9ea987337965b545ff', 1, 'Loja AgroPlay', 'loja@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(74, '029f526e26accb9ea987337965b545ff', 1, 'Marketing Agroplay', 'marketing@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(75, '029f526e26accb9ea987337965b545ff', 1, 'Matheus Agroplay', 'matheus@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(76, '029f526e26accb9ea987337965b545ff', 1, 'Natiele Ribeiro', 'natiele.ribeiro@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(77, '029f526e26accb9ea987337965b545ff', 1, 'Produção Estrada', 'producao.estrada@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(78, '029f526e26accb9ea987337965b545ff', 1, 'projetos Gestão', 'projetos@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(79, '029f526e26accb9ea987337965b545ff', 1, 'Publicidade - Agroplay Music', 'publicidade@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(80, '029f526e26accb9ea987337965b545ff', 1, 'Publicidade Ana Castela', 'publicidade_anacastela@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(81, '029f526e26accb9ea987337965b545ff', 1, 'Raphael Soares', 'rapha@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(82, '029f526e26accb9ea987337965b545ff', 1, 'Raphael Agroplay', 'raphael@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(83, '029f526e26accb9ea987337965b545ff', 1, 'agroplay records', 'records@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(84, '029f526e26accb9ea987337965b545ff', 1, 'rh1 agroplay', 'rh1@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(85, '029f526e26accb9ea987337965b545ff', 1, 'rh agroplay', 'rh@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(86, '029f526e26accb9ea987337965b545ff', 1, 'Robson Afonso', 'robson.afonso@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(87, '029f526e26accb9ea987337965b545ff', 1, 'Rodolfo Agroplay', 'rodolfo@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(88, '029f526e26accb9ea987337965b545ff', 1, 'Santhiago Menezes', 'santhiago@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(89, '029f526e26accb9ea987337965b545ff', 1, 'secretaria agro play music', 'secretaria@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(90, '029f526e26accb9ea987337965b545ff', 1, 'RH Agroplay', 'vagas@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(91, '029f526e26accb9ea987337965b545ff', 1, 'Valdir Cavallari', 'valdir.cavallari@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(92, '029f526e26accb9ea987337965b545ff', 1, 'VG - Agroplay', 'vg@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22'),
(93, '029f526e26accb9ea987337965b545ff', 1, 'Yasmin Siqueira', 'yasmin.siqueira@agroplaymusic.com.br', 'Sem senha', 'Google', 'Pendente', '2026-01-05 20:00:22');

-- --------------------------------------------------------

--
-- Estrutura para tabela `hardware_devices`
--

CREATE TABLE `hardware_devices` (
  `id` int(11) NOT NULL,
  `device_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `device_type` enum('Desktop','Notebook','Servidor','Workstation','Outro') COLLATE utf8_unicode_ci NOT NULL,
  `client_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cpu_model` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `cpu_cores` int(11) DEFAULT NULL,
  `cpu_frequency` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ram_size` int(11) NOT NULL COMMENT 'Em GB',
  `ram_type` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ram_speed` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL,
  `os_name` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `os_version` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `mac_address` varchar(17) COLLATE utf8_unicode_ci DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8_unicode_ci DEFAULT NULL,
  `serial_number` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `manufacturer` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `model` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `warranty_expiration` date DEFAULT NULL,
  `notes` text COLLATE utf8_unicode_ci,
  `status` enum('Ativo','Inativo','Manutenção','Descartado') COLLATE utf8_unicode_ci DEFAULT 'Ativo',
  `last_update` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `hardware_devices`
--

INSERT INTO `hardware_devices` (`id`, `device_name`, `device_type`, `client_name`, `location`, `cpu_model`, `cpu_cores`, `cpu_frequency`, `ram_size`, `ram_type`, `ram_speed`, `os_name`, `os_version`, `mac_address`, `ip_address`, `serial_number`, `manufacturer`, `model`, `purchase_date`, `warranty_expiration`, `notes`, `status`, `last_update`, `user_id`, `created_at`) VALUES
(1, 'PC-001', 'Desktop', 'Empresa Exemplo LTDA', 'Sala 101', 'Intel Core i7-12700K', 12, '3.6 GHz', 16, 'DDR4', '3200 MHz', 'Windows 11 Pro', '22H2', NULL, NULL, 'SN123456789', 'Dell', 'OptiPlex 7090', '2023-01-15', '2026-01-15', NULL, 'Ativo', '2026-03-16 14:04:51', 1, '2026-03-16 14:04:51'),
(2, 'NB-045', 'Notebook', 'Empresa Exemplo LTDA', 'Departamento TI', 'Intel Core i5-1135G7', 4, '2.4 GHz', 8, 'DDR4', '3200 MHz', 'Windows 11 Pro', '22H2', NULL, NULL, 'SN987654321', 'Lenovo', 'ThinkPad E14', '2023-06-20', '2026-06-20', NULL, 'Ativo', '2026-03-16 14:04:51', 1, '2026-03-16 14:04:51'),
(3, 'SRV-MAIN', 'Servidor', 'Interno', 'Data Center', 'Intel Xeon E5-2680 v4', 28, '2.4 GHz', 64, 'DDR4 ECC', '2400 MHz', 'Windows Server 2022', 'Standard', NULL, NULL, 'SN555666777', 'HP', 'ProLiant DL380 Gen10', '2022-03-10', '2025-03-10', NULL, 'Ativo', '2026-03-16 14:04:51', 1, '2026-03-16 14:04:51');

-- --------------------------------------------------------

--
-- Estrutura para tabela `network_diagrams`
--

CREATE TABLE `network_diagrams` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `data` longtext COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `network_diagrams`
--

INSERT INTO `network_diagrams` (`id`, `user_id`, `name`, `data`, `created_at`, `updated_at`) VALUES
(1, 1, 'Macip', '{\"nodes\":[{\"id\":\"node_1767992053996\",\"type\":\"networkNode\",\"position\":{\"x\":165,\"y\":105},\"data\":{\"label\":\"FORTIGATE 40F\",\"icon\":\"Shield\"},\"measured\":{\"width\":119,\"height\":80},\"selected\":true,\"dragging\":false},{\"id\":\"node_1767992055884\",\"type\":\"networkNode\",\"position\":{\"x\":105,\"y\":-30},\"data\":{\"label\":\"Sercomtel\",\"icon\":\"Globe\"},\"measured\":{\"width\":102,\"height\":80},\"selected\":false,\"dragging\":false},{\"id\":\"node_1767992058533\",\"type\":\"networkNode\",\"position\":{\"x\":240,\"y\":-30},\"data\":{\"label\":\"NG TELECOM\",\"icon\":\"Globe\"},\"measured\":{\"width\":108,\"height\":80},\"selected\":false,\"dragging\":false}],\"edges\":[{\"source\":\"node_1767992055884\",\"target\":\"node_1767992053996\",\"animated\":true,\"style\":{\"stroke\":\"#3b82f6\",\"strokeWidth\":2},\"id\":\"xy-edge__node_1767992055884-node_1767992053996\"},{\"source\":\"node_1767992058533\",\"target\":\"node_1767992053996\",\"animated\":true,\"style\":{\"stroke\":\"#3b82f6\",\"strokeWidth\":2},\"id\":\"xy-edge__node_1767992058533-node_1767992053996\"}],\"viewport\":{\"x\":64.783831463925935167935676872730255126953125,\"y\":161.53542918620024693154846318066120147705078125,\"zoom\":1.51571656651039798902047550654970109462738037109375}}', '2026-01-09 20:27:59', '2026-01-09 20:55:18');

-- --------------------------------------------------------

--
-- Estrutura para tabela `o365_clients`
--

CREATE TABLE `o365_clients` (
  `id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `o365_clients`
--

INSERT INTO `o365_clients` (`id`, `user_id`, `client_name`, `contact_email`, `created_at`) VALUES
('10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Serra Contábil', 'macip@serracontabil.com.br', '2025-12-19 15:03:46'),
('155ea8c6ebc54d463fcc5c2424de5812', 1, 'Hidromar', 'macip@hidromar.com.br', '2026-02-27 12:27:21'),
('16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Debt', 'macip@debt.com.br', '2025-12-19 15:03:46'),
('182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Laboratório Romanini', 'macip@romanini.com.br', '2025-12-19 15:03:46'),
('2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Santarem', 'macip@supersantarem.onmicrosoft.com', '2025-12-19 15:03:46'),
('2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'Eagleflex', 'macip@eagleflex.com.br', '2025-12-19 15:03:46'),
('3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Agroplay', 'macip@agroplay.onmicrosoft.com', '2025-12-19 15:03:46'),
('43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'Schiavon & Morais', 'admin@gruposm.ind.br', '2025-12-19 15:03:46'),
('597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'Hydronlubz', 'macip@hydronlubz.com.br', '2025-12-19 15:03:46'),
('5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Carga Pesada', 'macip@cpesada.onmicrosoft.com', '2025-12-19 15:03:46'),
('9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'Grupo HP Eletromecânica ', 'macip@grupohpeletromecanica.com.br', '2025-12-19 15:03:46'),
('c702eaa8-2b3e-4f74-b871-ba35e905e31d', 1, 'Focus Inteligência Financeira', 'macip@focusinteligencia.com.br', '2025-12-19 15:03:46'),
('cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'Amaral Vasconcellos', 'macip@amaralvasconcellos.com.br', '2025-12-19 15:03:46'),
('d1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Compenfort', 'macip@compenfort.onmicrosoft.com', '2025-12-19 15:03:46'),
('e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Royal Plazashopping', 'macip@royalplazashopping.com.br', '2025-12-19 15:03:46');

-- --------------------------------------------------------

--
-- Estrutura para tabela `o365_licenses`
--

CREATE TABLE `o365_licenses` (
  `id` int(11) NOT NULL,
  `client_id` varchar(36) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `license_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `renewal_status` varchar(50) COLLATE utf8_unicode_ci DEFAULT 'Pendente',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `o365_licenses`
--

INSERT INTO `o365_licenses` (`id`, `client_id`, `user_id`, `username`, `email`, `password`, `license_type`, `renewal_status`, `created_at`) VALUES
(2, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'Macip', 'macip@hydronlubz.com.br', '##mac@1.2##', 'sem licença', 'Pendente', '2025-12-19 15:03:46'),
(13, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ACORDO - PAVCOB', 'acordo@pavcob.com.br', 'Xog01263', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(14, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AGNES LEMOS', 'agnes.lemos@amaralvasconcellos.com.br', 'L%193904017743or', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(16, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ALEXANDER LUKASZCZUK - AMARAL VASCONCELLOS', 'alex@amaralvasconcellos.com.br', 'Pad40214z', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(17, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA DELGADO SARDI - AMARAL VASCONCELLOS', 'amanda.sardi@amaralvasconcellos.com.br', 'Lot34234p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(18, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA FAVARO RIGONE - AMARAL VASCONCELLOS', 'amanda.rigone@amaralvasconcellos.com.br', 'B(450025930256uk', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(19, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA FAVARO RIGONE PAG PLANOS - AMARAL VASCONCELLOS', 'pagamentoplanos@amaralvasconcellos.com.br', 'V*397922737357of', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(20, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA LOPES DE SOUZA - AMARAL VASCONCELLOS', 'supervisor.aj@amaralvasconcellos.com.br', 'T/381410945733al', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(22, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA MANTOVANI', 'amanda.mantovani@amaralvasconcellos.com.br', 'Kor27452', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(23, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AMANDA RAMOS SCUPINARI - AMARAL VASCONCELLOS', 'amanda.scupinari@amaralvasconcellos.com.br', 'J/345781909576ug', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(24, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANA CAROLINE GOULART DA SILVA – PEDRIALI E VASCONCELLOS', 'cartorios@amaralvasconcellos.com.br', 'L)211483424797ay', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(25, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANA JULLIA DOS SANTOS - PAVCOB', 'sdr1@pavcob.com.br', 'Vot46578', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(26, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANA LUIZA SILVA', 'analuiza.silva@amaral', 'M!844628234209ul', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(27, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANA PAULA FAVARETTO MACHADO - AMARAL VASCONCELLOS', 'ana.favaretto@amaralvasconcellos.com.br', 'W)036347896458aw', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(28, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANALISE DE INICIAIS - AMARAL VASCONCELLOS', 'analise.iniciais@amaralvasconcellos.com.br', 'M^009787418832ux', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(29, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANDRESSA DA SILVA  - AMARAL VASCONCELLOS', 'andressadasilva@amaralvasconcellos.com.br', 'S#752978588281uf', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(30, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANDREZA DOS SANTOS - AMARAL VASCONCELLOS', 'acordo3ctba@amaralvasconcellos.com.br', 'F*911007977947ay', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(31, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANGELICA AGUIAR DE SOUZA - PAVCOB', 'angelica.souza@pavcob.com.br', 'Y)016570681869uw', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(32, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANGELICA CRISTINA HOSSAKA - AMARAL VASCONCELLOS', 'angelica@amaralvasconcellos.com.br', 'Puj79709', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(33, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANGELICA HOSSAKA - AMARAL VASCONCELLOS', 'trabalhista@amaralvasconcellos.com.br', '', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(34, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANNE FERRERIRA - AMARAL VASCONCELLOS', 'alvara@amaralvasconcellos.com.br', 'N/044292865851aj', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(35, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANTONIO VINICIUS DE CARVALHO VASCONCELOS ARGOLO - AMARAL VASCONCELLOS', 'antonio.argolo@amaralvasconcellos.com.br', 'Nuf36130', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(36, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'AROLDO FERREIRA DA SILVA  FERREIRA DA SILVA', 'aroldo.silva@amaralvasconcellos.com.br', 'Gus159@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(37, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BEATRIZ LIMA - AMARAL VASCONCELLOS', 'juridico10@amaralvasconcellos.com.br', 'Had41667', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(38, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BEATRIZ LOPES - DEBT', 'beatriz.lopes@debt.com.br', 'M%452120614811ux', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(39, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BRUNA CORSI LASKOS VICENTE - AMARAL VASCONCELLOS', 'bruna@amaralvasconcellos.com.br', 'AbLna82351#p1', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(40, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BRUNA DANIELLE BRAMBILLA BICHERI - AMARAL VASCONCELLOS', 'brunabicheri@amaralvasconcellos.com.br', 'Vop88365', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(41, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BRUNA DE OLIVEIRA MARTINS - AMARAL VASCONCELLOS', 'brunamartins@amaralvasconcellos.com.br', 'G*395070120272al', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(42, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BRUNO AGUIAR RECHI', 'sdr4@pavcob.com.br', 'N^006134074057ac', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(44, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CALCULOS - AMARAL VASCONCELLOS', 'calculos@amaralvasconcellos.com.br', 'Y%236538858279up', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(45, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAMILA ALVES - PAVCOB', 'acordo5@pavcob.com.br', 'Put213@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(46, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAMILA FERNANDES DE OLIVEIRA - AMARAL VASCONCELLOS', 'obrigacao.civel2@amaralvasconcellos.com.br', 'M$215455445596as', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(47, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAMILA FERNANDES DE OLIVEIRA - AMARAL VASCONCELLOS', 'camila.oliveira@amaralvasconcellos.com.br', 'P^520999590326on', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(48, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAMILA KAORI FEGURY - AMARAL VASCONCELLOS', 'camila.fegury@amaralvasconcellos.com.br', 'L&560094643935ay', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(49, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAMILA MARCHIORI - PAVCOB', 'camila.marchiori@amaralvasconcellos.com.br', 'Voh04154', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(50, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CARINA  DUARTE ZAMBONI - PAVCOB', 'acordo14@pavcob.com.br', 'Tab222@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(51, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CARINA  DUARTE ZAMBONI - PAVCOB', 'carlos.reis@amaralvasconcellos.com.br', 'M%561516006310ak', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(52, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CARLOS HENRIQUE DE OLIVEIRA - AMARAL VASCONCELLOS', 'carlos.oliveira@amaralvasconcellos.com.br', 'N&791446905300ab', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(53, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CARLOS LIMA', 'carlos.lima@amaralvasconcellos.com.br', 'S@283986088110ax', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(54, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAROLINA DIAS GODOI - AMARAL VASCONCELLOS', 'carol.godoi@amaralvasconcellos.com.br', 'Qog00966', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(55, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAROLINA YUMI CHANG YAMADA - AMARAL VASCONCELLOS', 'carolinayamada@amaralvasconcellos.com.br', 'V(152802594392ak', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(56, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CAROLINE CONRADO CHIGNALIA - AMARAL VASCONCELLOS', 'caroline.chignalia@amaralvasconcellos.com.br', 'Gas38132', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(57, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'CENTRAL - AMARAL VASCONCELLOS', 'central@amaralvasconcellos.com.br', 'Log38600p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(58, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DANIEL - AMARAL VASCONCELLOS', 'daniel@amaralvasconcellos.com.br', 'Ruz23567p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(59, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DANIEL ANDRADE', 'daniel.andrade@amaralvasconcellos.com.br', 'M#317689942740or', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(60, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DANIELI LUZIA DO AMARAL FERREIRA PERUZZO - AMARAL VASCONCELLOS', 'honorarios1@amaralvasconcellos.com.br', 'Tuv123@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(61, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DEBORAH CELESTE FREITAS - AMARAL VASCONCELLOS', 'deborah.freitas@amaralvasconcellos.com.br', 'Dul54100', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(62, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DIOGO HENRIQUE DE ALMEIDA BRAIANI - AMARAL VASCONCELLOS', 'diogo.braiani@amaralvasconcellos.com.br', 'Caz135@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(63, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'DIRIGENCIAS - AMARAL VASCONCELLOS', 'administrador6@amaralvasconcellos.com.br', 'Tav581@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(64, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EDUARDA CASTRO AGUERA GARCIA - AMARAL VASCONCELLOS', 'eduarda.garcia@amaralvasconcellos.com.br', 'F%518153303169an$', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(65, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EDUARDO ALVARES - AMARAL VASCONCELLOS', 'terceirizacaoac@amaralvasconcellos.com.br', 'Qup23560', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(66, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EDUARDO TOLEDO DE CAIRES - AMARAL VASCONCELLOS', 'eduardo.caires@amaralvasconcellos.com.br', 'Jan87937', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(67, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ELABORAR PEÇAS - AMARAL VASCONCELLOS', 'elaborarpecas@amaralvasconcellos.com.br', 'Q^101428452487ay', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(68, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ELISANGELA DA SILVA FARIAS - AMARAL VASCONCELLOS', 'financeiro3@amaralvasconcellos.com.br', 'Bob452@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(69, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ELLEN GABRIELLA APARECIDA PEREIRA DA SILVA', 'sdr3@pavcob.com.br', 'Z^886943022140up', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(70, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ELZO BERALDO - AMARAL VASCONCELLOS', 'elzo@amaralvasconcellos.com.br', 'Lac87888p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(71, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EMILLY SALES AGUIAR SILVESTRE - AMARAL VASCONCELLOS', 'emilly.silvestre@amaralvasconcellos.com.br', 'G$557124894914um$', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(72, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EMILY CRISTINA ANTUNES MONSATO - PAVCOB', 'acordo20@pavcob.com.br', 'J@091004058509uy', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(73, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EQUIPE SDR - PAVCOB', 'sdr@pavcob.com.br', 'F%863363244715oy', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(74, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'EXTRA JUDICIAL SISPRIME - AMARAL VASCONCELLOS', 'extrajudicialsisprime@amaralvasconcellos.com.br', 'V(654313083932uf', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(75, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FELIPE BALATA - AMARAL VASCONCELLOS', 'felipe.balata@amaralvasconcellos.com.br', 'P/120721244661uq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(76, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FELIPE MATHEUS PASSOS DUARTE - AMARAL VASCONCELLOS', 'felipematheus@amaralvasconcellos.com.br', 'Moh39834p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(77, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FELIPE VIZETTI DAMASCENO RAMIREZ - AMARAL VASCONCELLOS', 'suporte@amaralvasconcellos.com.br', 'Cav159@ped1', 'Power BI Pro+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(78, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FERNANDA MANZINI PEDROSO DE ALMEIDA', 'acordo1.juridico@pavcob.com.br', 'Q&867316524847on', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(79, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FERNANDA TATIANA BEZERRA - PAVCOB', 'acordo.juridico@pavcob.com.br', 'Zav567@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(80, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FERNANDO ROGERIO CTBA', 'acordo5ctba@pavcob.com.br', 'K/835555053978uf@', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(81, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'FRANCINY KINSELER COLLOGE - AMARAL VASCONCELLOS', 'administrador1ctba@amaralvasconcellos.com.br', 'Xuq01715p', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(82, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GABRIELA ALVES - AMARAL VASCONCELLOS', 'gabriela.alves@amaralvasconcellos.com.br', 'Kux73155', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(83, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GABRIELA NEVES BERTONI  - AMARAL VASCONCELLOS', 'gabriella.bertoni@amaralvasconcellos.com.br', 'Qod72965', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(84, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GEOVANA DOS SANTOS - AMARAL VASCONCELLOS', 'geovana.santos@amaralvasconcellos.com.br', 'M(502726216954ac$', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(85, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GILBERTO PEDRIALI - AMARAL VASCONCELLOS', 'gilberto@amaralvasconcellos.com.br', 'Paw27652z', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(86, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GIOVANNA ACCORSI SANCHES - AMARAL VASCONCELOS', 'giovanna.sanches@amaralvasconcellos.com.br', 'Q@975463628364of', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(87, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GIOVANNA BONACIN', 'giovanna.bonacin@amaralvasconcellos.com.br', 'J%502953378127ag', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(88, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GIOVANNA LAIS DELGADO - AMARAL VASCONCELLOS', 'giovanna.delgado@amaralvasconcellos.com.br', 'Cat79216', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(89, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GIOVANNA SILVEIRA ALBINO BUENO – PEDRIALI E VASCONCELLOS', 'giovanna.bueno@amaralvasconcellos.com.br', 'Cub265@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(90, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GISELE DORIGUELI - AMARAL VASCONCELLOS', 'gisele@amaralvasconcellos.com.br', 'M#238527518900at', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(91, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GISELE GRIZOTTO- AMARAL VASCONCELLOS', 'gisele.grizotto@amaralvasconcellos.com.br', 'F(762125021208uc', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(92, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GLEICYAN REGIANE NUNES LUIZ - AMARAL VASCONCELLOS', 'gleicyan.luiz@amaralvasconcellos.com.br', 'Caq65030', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(93, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GUILHERME DORIGON BOVO - AMARAL VASCONCELLOS', 'guilhermedorigon.bovo@amaralvasconcellos.com.br', 'Cax18359', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(94, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GUILHERME DOS PASSOS SOUTO - AMARAL VASCONCELLOS', 'suporte2@amaralvasconcellos.com.br', 'Nub30248', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(95, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GUILHERME FERREIRA GIORGETTI - AMARAL VASCONCELLOS', 'contabilizacao@amaralvasconcellos.com.br', 'Wuw95409', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(96, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'IGOR HENRIQUE MACEDO DA SILVA - AMARAL VASCONCELLOS', 'estagioadm@amaralvasconcellos.com.br', 'Tab444@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(97, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ILSA LUCIANA MOREIRA - AMARAL VASCONCELLOS', 'rh1@amaralvasconcellos.com.br', 'Tus45437', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(98, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'INGRID KAWANE REGLLY AMARAL - AMARAL VASCONCELLOS', 'controladoria2@amaralvasconcellos.com.br', 'Cab159@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(99, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'INTIMAÇÂO - AMARAL VASCONCELLOS', 'intimacao@amaralvasconcellos.com.br', 'Mot15945', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(100, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ISABELA APARECIDA FAEDO PINTO - AMARAL VASCONCELLOS', 'isabela.faedo@amaralvasconcellos.com.br', 'Saq57108', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(102, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ISADORA TAGLIAPIETRA', 'isadora.tagliapietra@amaralvasconcellos.com.br', 'R#360469617755on', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(103, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'IZABELA ZACARIAS DOS SANTOS - AMARAL VASCONCELLO', 'izabela.santos@amaralvasconcellos.com.br', 'V#695643992716uz', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(104, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JESSICA AIUMI KATO DE OLIVEIRA - AMARAL VASCONCELLOS', 'jessica.oliveira@amaralvasconcellos.com.br', 'Moq65017', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(105, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JESSICA APARECIDA E SILVA BARBON - AMARAL VASCONCELLOS', 'jessica@amaralvasconcellos.com.br', 'Pos59030', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(107, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JESSICA CRIS AFFONSO - AMARAL VASCONCELLOS', 'jessica.affonso@amaralvasconcellos.com.br', 'Rux27925', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(108, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOÃO GABRIEL ARRUDA - AMARAL VASCONCELLOS', 'joaogabriel.arruda@amaralvasconcellos.com.br', 'Yoq61458', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(109, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOAO GUILHERME TERUI - AMARAL VASCONCELLOS', 'joao.terui@amaralvasconcellos.com.br', 'Pox07402', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(110, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOÃO PEDRO MEDICI DE LIMA', 'joao.lima@amaralvasconcellos.com.br', 'Mod96428', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(111, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOEY FOLMANN - AMARAL VASCONCELLOS', 'estagiarioctba@amaralvasconcellos.com.br', 'Tuk17014', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(112, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOY BRITO   ROLIM - AMARAL VASCONCELLOS', 'faturamento@amaralvasconcellos.com.br', 'Foq03404', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(113, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JOY BRITO ROLIM - AMARAL VASCONCELLOS', 'honorarios2@amaralvasconcellos.com.br', 'Kor95438', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(114, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JUAN DECARLI - AMARAL VASCONCELLOS', 'juan.decarli@amaralvasconcellos.com.br', 'V&561470156283uk', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(115, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JULIANE RAMOS DA SILVA - AMARAL VASCONCELLOS', 'acordo4ctba@pedrialivasconcellos.com.br', 'Dan26124', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(116, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'JULIO CESAR OLIVETTI DA SILVA - PAVCOB', 'acordo19@pavcob.com.br', 'R^714308135890uw', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(117, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KAREN  OLIVEIRA GARCIA', 'acordo18@pavcob.com.br', 'Zav999@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(118, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KARINE MARQUES DOS SANTOS - PAVCOB', 'acordo41@pavcob.com.br', 'Haf75697', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(119, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KARLA KEIKO WATANABE - AMARAL VASCONCELLOS', 'financeiro1@amaralvasconcellos.com.br', 'Kur65418', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(120, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KAROLINE RODRIGUES PEREIRA - AMARAL VASCONCELLOS', 'karolinerodrigues@amaralvasconcellos.com.br', 'Jal17646', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(121, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KAUÊ HENRIQUE FREIRES DE SOUZA - PAVCOB', 'sdr2@pavcob.com.br', 'Mab40088', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(122, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'KELI – AMARAL VASCONCELLOS', 'cadastros@amaralvasconcellos.com.br', 'N/796567158786oy', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(123, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LEONARDO  MARTINS GIROTO - PAVCOB', 'acordo13@pavcob.com.br', 'Zar151@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(124, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LETICIA MIDORI KONAGAI‎', 'ajuizamento@amaralvasconcellos.com.br', 'T%296879541104ar', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(125, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LETICIA SCHIAROLLI - AMARAL VASCONCELLOS', 'leticia.schiarolli@amaralvasconcellos.com.br', 'Dum96071', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(126, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUCAS DOS ANJOS RIBEIRO - AMARAL VASCONCELLOS', 'lucas@amaralvasconcellos.com.br', 'Tak83655p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(127, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUCAS GOULART', 'liquidacao2@amaralvasconcellos.com.br', 'G.093512319734ug', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(128, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUCAS LUIS', 'financeiro5@amaralvasconcellos.com.br', 'V.532192827663un', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(129, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUCAS MALMEGRIN - AMARAL VASCONCELLOS', 'lucas.malmegrin@amaralvasconcellos.com.br', 'L%432188490456um', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(130, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUCIANE KITANISHI - AMARAL VASCONCELLOS', 'luciane@amaralvasconcellos.com.br', 'Tad95887', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(131, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUIZA ALVARENGA', 'luiza.alvarenga@amaralvasconcellos.com.br', 'S%692063298172um', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(132, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LUIZA BRANDÃO BENTO – PEDRIALI E VASCONCELLOS', 'luiza.bento@amaralvasconcellos.com.br', 'Haz43374', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(133, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MACIP TECNOLOGIA - AMARAL VASCONCELLOS', 'admin@amaralvasconcellos.com.br', 'Q#688789127320av', 'Microsoft Power Automate Free', 'Pendente', '2025-12-19 15:03:46'),
(134, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MACIP TECNOLOGIA - AMARAL VASCONCELLOS', 'macip@amaralvasconcellos.com.br', '##ped@1.2##', 'Sem licença', 'Pendente', '2025-12-19 15:03:46'),
(135, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCELA ZANI VIANNA - AMARAL VASCONCELLOS', 'ajuizamento2@amaralvasconcellos.com.br', 'Zaz61813', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(136, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCIA REGINA VITORINO PEGO - AMARAL VASCONCELLOS', 'recursoshumanos@amaralvasconcellos.com.br', 'Hus34124', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(137, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCIA REGINA VITORINO PEGO - AMARAL VASCONCELLOS', 'recutamento@amaralvasconcellos.com.br', 'N@648764240623av', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(138, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCIO ALESSANDRO AGUIAR FONTANELA', 'marcio.fontanela@amaralvasconcellos.com.br', 'N^220786940488ak', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(139, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCOS C AMARAL VASCONCELLOS - AMARAL VASCONCELLOS', 'amaral@amaralvasconcellos.com.br', 'Vot48059p', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(140, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCOS TADASHI CAMARGO TAJIMA - AMARAL VASCONCELLOS', 'marcos.tajima@amaralvasconcellos.com.br', 'Gaw74726', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(141, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARCOS VINICIUS NOGUEIRA - AMARAL VASCONCELLOS', 'liquidacao@amaralvasconcellos.com.br', 'H!513134964981uk', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(142, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARIA EDUARDA MACIEL DE ALMEIDA - AMARAL VASCONCELLOS', 'mariaeduarda.almeida@amaralvasconcellos.com.br', 'Tac43716', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(143, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARIA FERNANDA PETRIN - AMARAL VASCONCELLOS', 'mariafernanda.petrin@amaralvasconcellos.com.br', 'Xog96424', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(144, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARINA D\'AMICO PEDRIALI - AMARAL VASCONCELLOS', 'marinapedriali@amaralvasconcellos.com.br', 'Xop00855', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(145, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MATHEUS HENRIQUE FERNANDES DE LIMA - AMARAL VASCONCELLOS', 'acordo.trabalhista2@amaralvasconcellos.com.br', 'Cat959@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(146, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MAXWEL ERNANDES MOREIRA DE SOUZA - AMARAL VASCONCELLOS', 'maxwel.souza@amaralvasconcellos.com.br', 'N#035870320775us', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(147, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MAYARA DE SOUZA', 'cartorios2@amaralvasconcellos.com.br', 'N.133056388354ov', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(148, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MAYRA CRISTINA GONÇALVES - AMARAL VASCONCELLOS', 'mayra.goncalves@amaralvasconcellos.com.br', 'Zuv70708', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(149, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MICHELLE DE SOUZA MERLO - AMARAL VASCONCELLOS', 'reembolso@amaralvasconcellos.com.br', 'Tar333@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(150, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MIKAEL DOUGLAS MARTINS - AMARAL VASCONCELLOS', 'administrador3ctba@amaralvasconcellos.com.br', 'Yuy28165p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(151, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MILLENA EDUARDA DA SILVA - AMARAL VASCONCELLOS', 'controladoria4@amaralvasconcellos.com.br', 'B&329699893122ud', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(152, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MILLENY VITÓRIA SANTOS IANI SIMÕES - AMARAL VASCONCELLOS', 'obrigacao.civel@amaralvasconcellos.com.br', 'C%236730509469uz', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(153, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MURILO BIANCO DA SILVA DURAES – PEDRIALI & VASCONCELLOS.', 'murilo.duraes@amaralvasconcellos.com.br', 'Zuc23489', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(154, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NAIARA GOMES FLOR - AMARAL VASCONCELLOS', 'naiara.flor@amaralvasconcellos.com.br', 'J.374466089071aq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(155, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NATALIA NUNES GIMENES - AMARAL VASCONCELLOS', 'financeiro2@amaralvasconcellos.com.br', 'Yum21767', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(156, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NATHALIA SANTANA', 'nathalia.santana@amaralvasconcellos.com.br', 'Y!519961803183up', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(157, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'Nfe Pavcob', 'nfepavcob@amaralvasconcellos.com.br', 'Loh58487z', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(158, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'Nfe Pedriali', 'nfe@amaralvasconcellos.com.br', 'Qoq20833', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(159, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NICKOLAS CAMPOS DE OLIVEIRA - AMARAL VASCONCELLOS', 'nickolas.oliveira@amaralvasconcellos.com.br', 'F)261952701431ar', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(160, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NICOLAS AUGUSTO DE ALMEIDA SILVA - AMARAL VASCONCELLOS', 'nicolas.silva@amaralvasconcellos.com.br', 'S$367199471441az', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(161, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NICOLLE RIBEIRO DE ASSIS - AMARAL VASCONCELLOS', 'controladoria1@amaralvasconcellos.com.br', 'M@502452275447av', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(162, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'OTTO MARCACCI RIBEIRO DA SILVA', 'otto.silva@amaralvasconcellos.com.br', 'Y%549253057806uf', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(163, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'PAGAMENTO TRABALHISTA - AMARAL VASCONCELLOS', 'pagamento.trabalhista@amaralvasconcellos.com.br', 'Cat235@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(164, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'PALOMA FERREIRA DE OLIVEIRA', 'paloma.oliveira@amaralvasconcellos.com.br', 'M@402712384720oc', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(165, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'PAULA D\'AMICO PEDRIALI - AMARAL VASCONCELLOS', 'paulapedriali@amaralvasconcellos.com.br', 'Jux44962p', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(166, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'PAULO HENRIQUE WALTRICK BARBOSA - AMARAL VASCONCELLOS', 'paulo.barbosa@amaralvasconcellos.com.br', 'Fok27316', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(167, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'POLIANE CRISTIANE DA SILVA - PAVCOB', 'acordo10@pavcob.com.br', 'Zab111@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(168, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RAFAEL MESTRE PORCELI', 'acordo16@pavcob.com.br', 'Cab595@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(169, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RAFAELLA MERCEDES- PAVCOB', 'acordo11@pavcob.com.br', 'Tum343@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(170, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RENATA CORAL DE OLIVEIRA - AMARAL VASCONCELLOS', 'renatacoral@amaralvasconcellos.com.br', 'Hum58592p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(171, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RENATO PEDRO DA SILVA - PAVCOB', 'acordo1@pavcob.com.br', 'Z&105640329227uq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(172, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ROBERTO CABRAL TEIXEIRA JUNIOR - AMARAL VASCONCELLOS', 'acordo.trabalhista1@amaralvasconcellos.com.br', 'Zat591@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(173, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ROBERTO CABRAL TEIXEIRA JUNIOR - AMARAL VASCONCELLOS', 'subsidio.trabalhista@amaralvasconcellos.com.br', 'Sur139@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(174, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RODRIGO DE ANDRADE ALVES BATISTA - AMARAL VASCONCELLOS', 'rodrigo@amaralvasconcellos.com.br', 'Z3WCyC13', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(175, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RODRIGO EUGENIO - AMARAL VASCONCELLOS', 'subsidios.civel@amaralvasconcellos.com.br', 'X)962938898299aj', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(176, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'RUBIA FREIBERGER GONZALES - AMARAL VASCONCELLOS', 'mariae.almeida@amaralvasconcellos.com.br', 'Woh42981', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(177, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'SELMA DA SILVA - PAVCOB', 'acordoplanos@pavcob.com.br', 'Zum555@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(178, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'SIBELLE ANDRETTO VENANCIO - AMARAL VASCONCELLOS', 'sibellevenancio@amaralvasconcellos.com.br', 'Bal06425', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(179, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'SISTEMA MATRIX', 'matrix@amaralvasconcellos.com.br', '', 'Power BI Pro+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(180, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'SOLANGE QUADROS DE JESUS - AMARAL VASCONCELLOS', 'acordo2ctba@amaralvasconcellos.com.br', 'Kac78461p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(181, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'TELRIANE PARMANHANI - AMARAL VASCONCELLOS', 'propostas.formalizacao@amaralvasconcellos.com.br', 'Zar595@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(182, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'THAYANA SOARES RAMOS - PAVCOB', 'acordo8@pavcob.com.br', 'Gab123@ped', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(183, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'TIAGO FELIPE SUSIN PIRES - AMARAL VASCONCELLOS', 'acordo1ctba@amaralvasconcellos.com.br', 'Xux732200', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(184, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'TIAGO PEREIRA LOPES DOS SANTOS - PAVCOB', 'acordo2@pavcob.com.br', 'Hap07445p', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(185, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'VANDERLAM FERNANDO DOS SANTOS - AMARAL VASCONCELLOS', 'acordosupervisor@amaralvasconcellos.com.br', 'Zof86282', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(186, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'TATIANA DE CASSIA SIVIERO PASSOS - AMARAL VASCONCELLOS', 'supervisoradm@amaralvasconcellos.com.br', 'P@977818524034al', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(187, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'VICTORIA GABRIELLA FONSECA LOUREIRO - AMARAL VASCONCELLOS', 'controladoriatrabalhista1@amaralvasconcellos.com.br', 'M)397263241812uj', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(188, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'VITOR DOS ANJOS RIBEIRO - AMARAL VASCONCELLOS', 'vitor@amaralvasconcellos.com.br', 'Hah79358p', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(189, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'VITORIA CONTIM SALLES DA FONSECA', 'vitoria.fonseca@amaralvasconcellos.com.br', 'T#194122835300uk', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(190, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'VITORIA KITAMURA BENTO - AMARAL VASCONCELLOS', 'vitoriabento@amaralvasconcellos.com.br', '', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(191, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'YANA RITA DOS SANTOS', 'infoprocessual@amaralvasconcellos.com.br', 'K%026719876217ap', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(192, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'YARA BISPO - AMARAL VASCONCELLOS', 'yara.bispo@amaralvasconcellos.com.br', 'T#436908402135uy', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(194, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'YASMIN CORREIA DE MORAES - AMARAL VASCONCELLOS', 'controladoria3@amaralvasconcellos.com.br', 'V*452320353966aq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(195, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ZOILO LUIZ BOLOGNESI - AMARAL VASCONCELLOS', 'zoilo@amaralvasconcellos.com.br', 'Xuj53554', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(196, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'Macip', 'macip@eagleflex.com.br', '##eag@1.2##', 'sem licença', 'Pendente', '2025-12-19 15:03:46'),
(197, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'almoxarifado@eagleflex.com.br', 'almoxarifado@eagleflex.com.br', 'Baz24292e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(198, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'comercial@eagleflex.com.br', 'comercial@eagleflex.com.br', 'M&750695656607oz', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(199, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'comercial1@eagleflex.com.br', 'comercial1@eagleflex.com.br', 'Vut29751e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(200, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'Daniela', 'comercial2@eagleflex.com.br', 'Poq55548e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(201, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'cp@eagleflex.com.br', 'cp@eagleflex.com.br', 'Lab71600e@', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(202, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'cr@eagleflex.com.br', 'cr@eagleflex.com.br', 'Kuv45378', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(203, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'diretoria@eagleflex.com.br', 'diretoria@eagleflex.com.br', 'Sad73748e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(204, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'diretoria1@eagleflex.com.br', 'diretoria1@eagleflex.com.br', 'Pon21929e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(205, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'eng@eagleflex.com.br', 'eng@eagleflex.com.br', 'Kaf26747e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(206, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'eng2@eagleflex.com.br', 'eng2@eagleflex.com.br', 'Vax48573e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(207, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'eng3@eagleflex.com.br', 'eng3@eagleflex.com.br', 'Y#560392469632ad', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(208, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'fabrica@eagleflex.com.br', 'fabrica@eagleflex.com.br', 'Ruf88352e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(209, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'eng1@eagleflex.com.br', 'eng1@eagleflex.com.br', 'C#720041687448ud', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(210, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'eng5@eagleflex.com.br', 'eng5@eagleflex.com.br', 'Tax32134e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(211, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'faturamento@eagleflex.com.br', 'faturamento@eagleflex.com.br', 'Vus45865e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(212, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'filialpe@eagleflex.com.br', 'filialpe@eagleflex.com.br', 'Voz19811', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(213, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'financeiro@eagleflex.com.br', 'financeiro@eagleflex.com.br', 'Wup51816', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(214, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'licitacoes@eagleflex.com.br', 'licitacoes@eagleflex.com.br', 'Jux24756e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(215, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'estagio1@eagleflex.com.br', 'estagio1@eagleflex.com.br', 'Hup95394e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(216, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'nfe@eagleflex.com.br', 'nfe@eagleflex.com.br', 'K)841557891829of', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(217, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'pcp@eagleflex.com.br', 'pcp@eagleflex.com.br', 'Nut67489e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(218, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'rh@eagleflex.com.br', 'rh@eagleflex.com.br', 'Zuf41947e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(219, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'suprimentos@eagleflex.com.br', 'suprimentos@eagleflex.com.br', 'Bac01258e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(220, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'suprimentos1@eagleflex.com.br', 'suprimentos1@eagleflex.com.br', 'Cas87393e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(221, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'suprimentos2@eagleflex.com.br', 'suprimentos2@eagleflex.com.br', 'Yub95776e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(222, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'vendas@eagleflex.com.br', 'vendas@eagleflex.com.br', 'Jal32110e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(223, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'vendas1@eagleflex.com.br', 'vendas1@eagleflex.com.br', 'Lax68669', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(224, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'vendas2@eagleflex.com.br', 'vendas2@eagleflex.com.br', 'Lah97201e', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(225, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'vendas4@eagleflex.com.br', 'vendas4@eagleflex.com.br', 'Bop73590', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(226, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'vendas5@eagleflex.com.br', 'vendas5@eagleflex.com.br', 'Dac43165', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(227, '2c1bc7d6-9528-4c23-b069-757a697dbbfd', 1, 'expedicao@eagleflex.com.br', 'expedicao@eagleflex.com.br', 'C!746077458096og', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(228, 'c702eaa8-2b3e-4f74-b871-ba35e905e31d', 1, 'Macip', 'macip@focusinteligencia.com.br', '##foc@1.2##', 'sem licença', 'Pendente', '2025-12-19 15:03:46'),
(230, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'adma@grupohpeletromecanica.com.br', 'adma@grupohpeletromecanica.com.br', 'Zan51971', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(231, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'admin@grupohpeletromecanica.com.br', 'admin@grupohpeletromecanica.com.br', 'senha da macip', 'Unlicensed', 'Pendente', '2025-12-19 15:03:46'),
(232, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'almoxarifado@grupohpeletromecanica.com.br', 'almoxarifado@grupohpeletromecanica.com.br', 'Yuf89340', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(233, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'almoxarifado02@grupohpeletromecanica.com.br', 'almoxarifado02@grupohpeletromecanica.com.br', '', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(234, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'andre@grupohpeletromecanica.com.br', 'andre@grupohpeletromecanica.com.br', 'Luq93864', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(235, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'astec@grupohpeletromecanica.com.br', 'astec@grupohpeletromecanica.com.br', 'P!354913038604ap', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(236, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'automacao@grupohpeletromecanica.com.br', 'automacao@grupohpeletromecanica.com.br', 'Qob84291', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(237, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'automacao02@grupohpeletromecanica.com.br', 'automacao02@grupohpeletromecanica.com.br', '', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(238, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'bruno@grupohpeletromecanica.com.br', 'bruno@grupohpeletromecanica.com.br', 'Fam29088', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(239, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'compras@grupohpeletromecanica.com.br', 'compras@grupohpeletromecanica.com.br', 'Nar41240', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(240, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'dalgoberto.jr@grupohpeletromecanica.com.br', 'dalgoberto.jr@grupohpeletromecanica.com.br', 'Low18021', 'Visio Plan 2+Microsoft Fabric (Free)+Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(241, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'dalgoberto@grupohpeletromecanica.com.br', 'dalgoberto@grupohpeletromecanica.com.br', 'grupohp123@', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(242, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'diogo@grupohpeletromecanica.com.br', 'diogo@grupohpeletromecanica.com.br', 'Joz99226', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(243, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'Gabriel Cordeiro', 'fabrica02@grupohpeletromecanica.com.br', 'Q!891329845287uq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(244, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'faturamento@grupohpeletromecanica.com.br', 'faturamento@grupohpeletromecanica.com.br', 'Dan47907', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(245, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'ANDERSON FERREIRA DA SILVA', 'faturamento02@grupohpeletromecanica.com.br', 'Hat29309', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(246, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'financeiro02@grupohpeletromecanica.com.br', 'financeiro02@grupohpeletromecanica.com.br', 'H*512351226986aj', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(247, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'garantia@grupohpeletromecanica.com.br', 'garantia@grupohpeletromecanica.com.br', 'Gus49159', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(248, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'hemerson@grupohpeletromecanica.com.br', 'hemerson@grupohpeletromecanica.com.br', 'Luj11788', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(249, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'henrique@grupohpeletromecanica.com.br', 'henrique@grupohpeletromecanica.com.br', 'Gal82691', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(250, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'jessica@grupohpeletromecanica.com.br', 'jessica@grupohpeletromecanica.com.br', 'Dus53024', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(251, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'joao.vitor@grupohpeletromecanica.com.br', 'joao.vitor@grupohpeletromecanica.com.br', 'Xax11869', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(252, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'julio.cesar@grupohpeletromecanica.com.br', 'julio.cesar@grupohpeletromecanica.com.br', 'Sag33066', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(253, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'kristopher@grupohpeletromecanica.com.br', 'kristopher@grupohpeletromecanica.com.br', 'C#353407703109un', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(254, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'lafaiete@grupohpeletromecanica.com.br', 'lafaiete@grupohpeletromecanica.com.br', 'P/900627132734oh', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46');
INSERT INTO `o365_licenses` (`id`, `client_id`, `user_id`, `username`, `email`, `password`, `license_type`, `renewal_status`, `created_at`) VALUES
(255, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'logistica@grupohpeletromecanica.com.br', 'logistica@grupohpeletromecanica.com.br', 'B@499487634399ul', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(256, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'lucas@grupohpeletromecanica.com.br', 'lucas@grupohpeletromecanica.com.br', 'Lud59093', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(257, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'luisfernando@grupohpeletromecanica.com.br', 'luisfernando@grupohpeletromecanica.com.br', 'Fop01208', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(258, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'macip@grupohpeletromecanica.com.br', 'macip@grupohpeletromecanica.com.br', 'senha da macip', 'Unlicensed', 'Pendente', '2025-12-19 15:03:46'),
(259, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'marketing@grupohpeletromecanica.com.br', 'marketing@grupohpeletromecanica.com.br', 'B.181763789274aj', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(260, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'matheus@grupohpeletromecanica.com.br', 'matheus@grupohpeletromecanica.com.br', 'L%308861447077av', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(261, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'nfe@grupohpeletromecanica.com.br', 'nfe@grupohpeletromecanica.com.br', 'Hus92390', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(262, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'oficina@grupohpeletromecanica.com.br', 'oficina@grupohpeletromecanica.com.br', '', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(263, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'otavio@grupohpeletromecanica.com.br', 'otavio@grupohpeletromecanica.com.br', 'Quj91866', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(264, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'patricia@grupohpeletromecanica.com.br', 'patricia@grupohpeletromecanica.com.br', 'P)134181412776uq', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(265, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'Edvaldo Júnior', 'fabrica01@grupohpeletromecanica.com.br', 'Q&158371848571ap', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(266, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'revendas@grupohpeletromecanica.com.br', 'revendas@grupohpeletromecanica.com.br', 'G/395302287002uv', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(267, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'robson@grupohpeletromecanica.com.br', 'robson@grupohpeletromecanica.com.br', 'T$543719010423uc', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(268, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'rodrigo@grupohpeletromecanica.com.br', 'rodrigo@grupohpeletromecanica.com.br', 'Gaf10768', 'Microsoft Power Automate Free+Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(269, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'service@grupohpeletromecanica.com.br', 'service@grupohpeletromecanica.com.br', '', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(270, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'usinagem@grupohpeletromecanica.com.br', 'usinagem@grupohpeletromecanica.com.br', 'V*958747133490uh', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(271, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'victorhugo@grupohpeletromecanica.com.br', 'victorhugo@grupohpeletromecanica.com.br', 'P(609526316621uq', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(272, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'vinicius@grupohpeletromecanica.com.br', 'vinicius@grupohpeletromecanica.com.br', 'Kor15722', 'Microsoft Power Automate Free+Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(273, '9b72ac1b-a300-420b-b047-5df266a8c9e0', 1, 'wellington@grupohpeletromecanica.com.br', 'wellington@grupohpeletromecanica.com.br', 'L@450537036912us', 'Microsoft 365 Business Standard', 'Pendente', '2025-12-19 15:03:46'),
(405, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'ANDRELIZA DE CAMPOS TOSO DIONIZIO', 'faturamento1@hydronlubz.com.br', 'Job18794', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(407, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'BRUNO CESAR VIEIRA', 'expedicao1@hydronlubz.com.br', 'Ruz39278', 'WEB', 'Pendente', '2025-12-19 15:03:46'),
(408, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'DANIEL PINHEIRO BATILANI', 'compras1@hydronlubz.com.br', 'Lul79412', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(409, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'DANIELE ANDRADE DE FARIA', 'rh@hydronlubz.com.br', 'Bos86483zx', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(410, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'DANIELE CALDEIRA TRASSI RODRIGUES', 'administrativo@hydronlubz.com.br', 'Yod70434', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(411, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'MATHEUS CAMPOS TERRA', 'logistica1@hydronlubz.com.br', '458081021531ux@', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(412, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'EDNEIA FERREIRA DA ROCHA DE ARAUJO', 'fiscal1@hydronlubz.com.br', 'Zaq97591', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(413, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'GLAUCIA OLIVEIRA DE CAMPOS', 'comex@hydronlubz.com.br', 'R.504382166628aq', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(414, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'GLAUCIA OLIVEIRA DE CAMPOS', 'comex@plicmobiliario.com.br', 'tIfpkK04E9u7@', '--', 'Pendente', '2025-12-19 15:03:46'),
(415, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'HUGO HENRIQUE MÓRIS NONAKA', 'industrial@hydrolubz.com.br', 'Qos69404', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(416, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'ISABELLA DE SOUZA CORSATO', 'cobranca1@plicmobiliario.com.br', 'i8V79Uo3JoGc@', '--', 'Pendente', '2025-12-19 15:03:46'),
(417, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'Cobranca1', 'cobranca1@hydronlubz.com.br', ' H/746534094180ub', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(418, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'JEICIENE FELICIANO LEITE', 'suporte1@hydronlubz.com.br', 'Hak23588', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(419, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'JOAO VITOR SANTANA', 'comercial2@hydronlubz.com.br', 'Lap29235', 'WEB', 'Pendente', '2025-12-19 15:03:46'),
(420, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'MATHEUS CAMPOS TERRA', 'almoxaifado1@hydronlubz.com.br', 'Tuc65396', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(421, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'NAYARA THAIS CAMPOS DE SA', 'comercial1@hydronlubz.com.br', 'Tak84195', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(422, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'ROSILENE DA CRUZ', 'astec@hydronlubz.com.br', 'Zah88313', 'WEB', 'Pendente', '2025-12-19 15:03:46'),
(423, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'TELMO ANTÔNIO DA SILVA', 'compras@hydronlubz.com.br', 'Zuc69057', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(424, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'THIAGO NERES LOPES', 'vendas10@hydronlubz.com.br', '', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(425, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'WENDER APARECIDO MENEGON', 'producao@hydronlubz.com.br', 'Pof46372', 'FISICO', 'Pendente', '2025-12-19 15:03:46'),
(426, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'WENDRYL CORDEIRO DOS SANTOS', 'design1@hydronlubz.com.br', 'Sas03174', 'WEB', 'Pendente', '2025-12-19 15:03:46'),
(508, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MARIA FERNANDA MIYASHITA - AMARAL VASCONCELLOS', 'mariaf.miyashita@amaralvasconcellos.com.br', 'V%380536698313uh', 'Microsoft 365 Business Basic', 'Pendente', '2025-12-19 15:03:46'),
(782, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'Admin', 'admin@gruposm.ind.br', '((macip123@))', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(783, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'bordado01@gruposm.ind.br', 'bordado01@gruposm.ind.br', 'Huz14654s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(784, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'cobranca01@gruposm.ind.br', 'cobranca01@gruposm.ind.br', 'R(090073942915uj', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(785, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'compras@gruposm.ind.br', 'compras@gruposm.ind.br', 'Cuh95821s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(786, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'corte02@gruposm.ind.br', 'corte02@gruposm.ind.br', 'Yox01885', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(787, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'Edson', 'desenvol01@gruposm.ind.br', 'Luy01211s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(788, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'desenvol02@gruposm.ind.br', 'desenvol02@gruposm.ind.br', 'Sop07862s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(789, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'desenvol03@gruposm.ind.br', 'desenvol03@gruposm.ind.br', 'Yub79291', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(790, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'diogenes@gruposm.ind.br', 'diogenes@gruposm.ind.br', 'Kon95060s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(791, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'isabela@gruposm.ind.br', 'isabela@gruposm.ind.br', '', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(792, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'renata@gruposm.ind.br', 'renata@gruposm.ind.br', 'Gov10431s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(793, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'geovendas@gruposm.ind.br', 'geovendas@gruposm.ind.br', 'Lur13777', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(794, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'juridico@gruposm.ind.br', 'juridico@gruposm.ind.br', 'Fag77323s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(795, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'leandrogb@gruposm.ind.br', 'leandrogb@gruposm.ind.br', 'Tol36085s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(796, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'loja@gruposm.ind.br', 'loja@gruposm.ind.br', 'Danys123@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(797, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'marcio@gruposm.ind.br', 'marcio@gruposm.ind.br', 'Puq86073s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(798, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'marketing01@gruposm.ind.br', 'marketing01@gruposm.ind.br', 'Jum69146s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(799, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'modelagem01@gruposm.ind.br', 'modelagem01@gruposm.ind.br', 'Ful45175s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(800, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'modelagem02@gruposm.ind.br', 'modelagem02@gruposm.ind.br', 'Xop34719s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(801, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'nfe@gruposm.ind.br', 'nfe@gruposm.ind.br', 'Ruv89896', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(802, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'crono01@gruposm.ind.br', 'crono01@gruposm.ind.br', 'Nol57412s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(803, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'pedidos@gruposm.ind.br', 'pedidos@gruposm.ind.br', 'danys12@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(804, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'matheus@gruposm.ind.br', 'matheus@gruposm.ind.br', 'Cuq20715s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(805, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'recepcao@gruposm.ind.br', 'recepcao@gruposm.ind.br', 'danys12@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(806, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'rh01@gruposm.ind.br', 'rh01@gruposm.ind.br', 'L*509146398148ab', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(807, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'rh02@gruposm.ind.br', 'rh02@gruposm.ind.br', 'Fur39059s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(808, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'almox01@gruposm.ind.br', 'almox01@gruposm.ind.br', 'Tod49930s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(809, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'corte03@gruposm.ind.br', 'corte03@gruposm.ind.br', 'Kuk26756s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(810, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'costura01@gruposm.ind.br', 'costura01@gruposm.ind.br', 'Gaw11087s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(811, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'marketing02@gruposm.ind.br', 'marketing02@gruposm.ind.br', 'catucci12@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(812, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'lav01@tomblues.com.br', 'lav01@tomblues.com.br', 'Loq26126s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(813, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'nfe@tomblues.com.br', 'nfe@tomblues.com.br', 'Sot33103s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(814, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'desenvol01@tomblues.com.br', 'desenvol01@tomblues.com.br', 'Noc25152', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(815, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'aca01@tomblues.com.br', 'aca01@tomblues.com.br', 'Qal20450s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(816, '43e39bf2-6bc7-4311-809d-9bad904a0e17', 1, 'exp01@tomblues.com.br', 'exp01@tomblues.com.br', 'Not04883s', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(817, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Macip', 'macip@supersantarem.onmicrosoft.com', '##san@1.2##', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(818, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPÇÃO', 'parigot@supersantarem.onmicrosoft.com', 'Tun62868', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(819, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPÇÃO', 'violim@supersantarem.onmicrosoft.com', 'Bat34620', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(820, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPÇÃO', 'cafezal@supersantarem.onmicrosoft.com', 'Kul78493', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(821, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPÇÃO', 'saojoao@supersantarem.onmicrosoft.com', 'Dag82716', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(822, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPÇÃO', 'figueira@supersantarem.onmicrosoft.com', 'Tuy84644', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(823, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Yara', 'financeiro.faturamento@supersantarem.onmicrosoft.com', 'Toh81816', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(824, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Luciane', 'financeiro.ramiro@supersantarem.onmicrosoft.com', 'Fuf85895', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(825, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Debora', 'faturamento2@supersantarem.onmicrosoft.com', 'Qok09204', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(826, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Jessica Faria', 'faturamento1@supersantarem.onmicrosoft.com', 'Xoc65431', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(827, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Rose Paula', 'financeiro.receber@supersantarem.onmicrosoft.com', 'Nam20974', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(828, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Sheila', 'financeiro.pagar@supersantarem.onmicrosoft.com', 'Muv87253', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(829, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Camila Valerio', 'aux.contabilidade@supersantarem.onmicrosoft.com', 'Kop36820', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(830, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Simone', 'rh@supersantarem.onmicrosoft.com', 'Muy49972', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(831, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Rosiley', 'contabilidade@supersantarem.onmicrosoft.com', 'Zat30436', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(832, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Diego', 'comercial1@supersantarem.onmicrosoft.com', 'Qow30264', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(833, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'MARIANA', 'financeiro.faturamento2@supersantarem.onmicrosoft.com', 'Kag94772', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(834, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Helen', 'helen.tchopko@supersantarem.onmicrosoft.com', 'Jom01693', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(835, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Rodrigo', 'rodrigo.alves@supersantarem.onmicrosoft.com', 'Muf83527', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(836, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Maria', 'maria.alves@supersantarem.onmicrosoft.com', 'Lax95527', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(837, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Andrea', 'financeiro@supersantarem.onmicrosoft.com', 'Muc02976', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(838, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DP Cafezal', 'deposito.cafezal@supersantarem.onmicrosoft.com', 'Vuk28202', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(839, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DP Parigot', 'deposito.parigot@supersantarem.onmicrosoft.com', 'Wuz52425', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(840, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DP Figueira', 'deposito.figueira@supersantarem.onmicrosoft.com', 'Dax34238', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(841, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DP Violim', 'deposito.violim@supersantarem.onmicrosoft.com', 'Poh56626', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(842, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DP São Joao', 'deposito.saojoao@supersantarem.onmicrosoft.com', 'Vot55672', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(843, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Padaria SJ', 'padaria.saojoao@supersantarem.onmicrosoft.com', 'Gah06445', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(844, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Alessandra', 'compraevenda2@supersantarem.onmicrosoft.com', 'V)012219520552ur', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(845, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Lincoln', 'aux.dppessoal@supersantarem.onmicrosoft.com', 'Mod08594', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(846, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, '', 'aux.dppessoal2@supersantarem.onmicrosoft.com', 'N!828861874422uc', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(847, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'ADMIN', 'admin@supersantarem.onmicrosoft.com', 'R*867230849041ot', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(848, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Elias', 'cpd2@supersantarem.onmicrosoft.com', 'Dov19301', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(849, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Cesar', 'compraevenda@supersantarem.onmicrosoft.com', 'Vay06144', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(850, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Paulo', 'prevencao@supersantarem.onmicrosoft.com', 'Jom97086', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(851, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'NOTE01', 'note01@supersantarem.onmicrosoft.com', 'Duf65495', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(852, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'NOTE02', 'note02@supersantarem.onmicrosoft.com', 'Jaw99960', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(853, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'NOTE03', 'note03@supersantarem.onmicrosoft.com', 'Pox53963', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(854, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'NOTE04', 'note04@supersantarem.onmicrosoft.com', 'M(524349611447ub', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(855, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Ecommerce', 'ecommercesantarem@supersantarem.onmicrosoft.com', 'G)832779552844us', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(856, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'RECEPCAO', 'jardins@supersantarem.onmicrosoft.com', 'R.570409557264oy', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(857, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'DEPOSITO', 'deposito.jardins@supersantarem.onmicrosoft.com', 'P/995511051551om', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(858, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'Julia Alves', 'julia@supersantarem.onmicrosoft.com', 'P!826721831657av', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(859, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Macip', 'macip@royalplazashopping.com.br', '##roy@1.2##', 'sem licença', 'Pendente', '2026-01-05 16:22:43'),
(860, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Lucas Norihiko Shimada', 'adm@royalplazashopping.com.br', 'roy@@$2025', 'Basic', 'Renovado', '2026-01-05 16:22:43'),
(861, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'FELIPE', 'adm1@royalplazashopping.com.br', 'roy@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(862, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'SÍLVIA', 'adm2@royalplazashopping.com.br', 'roy@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(863, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Central', 'central@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(864, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'JOÃO', 'comercial1@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(865, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'comercial@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(866, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'comercial2@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(867, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'consultoria@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(868, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Denison', 'compras@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(869, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'LUIZ ROBERTO', 'diretoria@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(870, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Denison', 'manutencao@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(871, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'ROSE e BIA', 'mkt@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(872, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'noreply@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(873, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'ANA', 'obra@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(874, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'LEANDRA', 'obra2@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(875, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'operacao@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(876, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'operacoes@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(877, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'postmaster@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(878, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'GLEICE', 'recepcao@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(879, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Galindo', 'seguranca@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(880, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'MARCELO', 'sindico@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(881, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, '', 'backup@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(882, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'ELIANE', 'comercial3@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(883, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Robson Pedro', 'robson.pedro@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(884, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Rosimara Rodrigues', 'rosimara.rodrigues@royalplazashopping.com.br', 'adm@@$2025', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(885, 'e8007ff1-766b-4566-9dd1-e94ba86e3fe8', 1, 'Marcelo Peralta', 'marcelo.peralta@royalplazashopping.com.br', 'adm@@$2026', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(886, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Macip', 'macip@romanini.com.br', '##rom@1.2##', 'sem licença', 'Pendente', '2026-01-05 16:22:43'),
(887, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Jennifer', 'financeiro2@romanini.com.br', 'Fob10206', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(888, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Juliana', 'financeiro@romanini.com.br', 'Ruf16893', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(889, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Miriele', 'atendimento@romanini.com.br', 'Zal64195', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(890, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Miriele', 'expedicao@romanini.com.br', 'Kul85236', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(891, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Natalia/Júlia', 'ceramica@romanini.com.br', 'Kup46632', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(892, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'Júlia', 'triagem@romanini.com.br', 'Lol18305', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(893, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'José Carlos Romanini', 'romanini@romanini.com.br', 'Y#677379918262um', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(894, '182b570e-3aac-49b0-af92-0182500caf7f', 1, 'acesso admin', 'admin@romanini.com.br', '##rom@1.2##', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(896, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Marcos', 'marcos@serracontabil.onmicrosoft.com', 'Ser@2030s$', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(897, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Beatriz', 'contato@serracontabil.onmicrosoft.com', 'Serra@2020', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(898, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Jefferson', 'expediente1@serracontabil.onmicrosoft.com', 'Serra@2020', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(899, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Ivan', 'expediente4@serracontabil.onmicrosoft.com', 'Serra@2022', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(900, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Ione', 'fiscal1@serracontabil.onmicrosoft.com', 'Serra@2020', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(901, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Igor Rpdrigues', 'expediente1@serracontabil.com.br', 'Serra@2020', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(902, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Vanessa', 'expediente2@serracontabil.onmicrosoft.com', 'Serra@123', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(903, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Karen', 'expediente3@serracontabil.onmicrosoft.com', 'Serra@2025', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(904, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Cristiane', 'folha@serracontabil.onmicrosoft.com', 'Serra@2021$', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(905, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, '', 'expediente6@serracontabil.com.br', 'Serra@2020', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(906, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, '', 'expediente7@serracontabil.com.br', 'Serra123@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(907, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, '', 'comercial@serracontabil.com.br', '', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(908, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Julia Serra', 'expediente5@serracontabil.com.br', 'Serra@3738', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(909, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, '', 'expediente9@serracontabil.com.br', 'W.186086292149ac', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(910, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, '', 'atendimento@serracontabil.com.br', 'Serra@3738@', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(911, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'admin', 'admin@serracontabil.com.br', 'B!751013679386ar', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(912, '10ffa0a8-adbb-4bb9-b322-ca9ef61514cc', 1, 'Macip', 'macip@serracontabil.com.br', '##serra1.2@##$%', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(936, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Administrador', 'admin@debt.com.br', 'Ray45396', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(937, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Ana Paula Stante', 'anapaula@debt.com.br', 'Lub16404', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(938, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Camila Fernanda', 'camila.fernanda@debt.com.br', 'Ban46357', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(939, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Daniel Gatzk de Arruda', 'daniel@debt.com.br', 'Qay53910', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(940, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Dilma Brites', 'dilma@debt.com.br', 'Son10125', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(941, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Giovana Guimarães', 'giovana@debt.com.br', 'Koz59447', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(942, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Gislaine Silva', 'gislaine@debt.com.br', 'Noh29807', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(943, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Heloisa Rodrigues', 'heloisa@debt.com.br', 'Zaz29483', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(944, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Lucas Duarte', 'lucas@debt.com.br', 'Haz71916', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(945, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Luciano Sampaio', 'luciano@debt.com.br', 'Fos56553', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(946, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'MAC-IP Tecnologia', 'macip@debt.com.br', '(((Sucesso123@)))', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(947, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Pedro Henrique Trevisone', 'pedro@debt.com.br', 'Tul83793', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(948, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Priscila Souza', 'priscila.souza@debt.com.br', 'Nag47172', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(949, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Ricardo Lima', 'ricardo@debt.com.br', 'Wux90529', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(950, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Rita Cordeiro', 'rita@debt.com.br', 'Lom17908', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(951, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Silvana Aparecida', 'silvana@debt.com.br', 'Yof30093', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(952, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Sthephanie Camara', 'sthephanie@debt.com.br', 'Puf09600', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(953, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Tamires Rodrigues', 'tamires@debt.com.br', 'Sux43652', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(954, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Tays Gomes', 'tays@debt.com.br', 'Nof77899', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(955, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Vanessa Gonçalves', 'vanessa@debt.com.br', 'Fud40853', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(956, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Victor Zielinski', 'victor@debt.com.br', 'Koh92464', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(957, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Vitoria Salvador', 'vitoria@debt.com.br', 'Dop29800', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(958, '16ca09fe-d9aa-41c9-b98e-f9e0d47252a7', 1, 'Gabrielly Brites', 'gabrielly.brites@debt.com.br', 'X(845358333862ow', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(959, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Macip', 'macip@cpesada.onmicrosoft.com', '##car21.2##', 'sem licença', 'Pendente', '2026-01-05 16:22:43'),
(960, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'ADM01', 'adm01@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(961, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'ADM02', 'adm02@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(962, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'ADM03', 'adm03@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(963, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'ADM04', 'adm04@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(964, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Ana', 'ana@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(965, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Financeiro - Maringa', 'financeiromga@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(966, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Karen', 'karen@cargapesada.com', '', 'Microsoft 365 Business Standard', 'Pendente', '2026-01-05 16:22:43'),
(967, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Licitação', 'licita@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(968, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Luis Otavio', 'luisotavio@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(969, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Mauro', 'mauro@cargapesada.com', '', 'Microsoft 365 Business Standard', 'Pendente', '2026-01-05 16:22:43'),
(970, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'NFE', 'nfe@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(971, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Producao01', 'prod01@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Standard', 'Pendente', '2026-01-05 16:22:43'),
(972, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Vendas01', 'venda01@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(973, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Victor', 'victor@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(974, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Eduardo - Maringa', 'eduardo@cargapesada.com', 'Cargamga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(975, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Loja - Maringa', 'loja@cargapesada.com', 'Cargamga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(976, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'SAC - Maringa', 'sac@cargapesada.com', 'Cargamga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(977, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Maringa', 'maringa@maringa.com', 'Cargamga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(978, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Funcionarios', 'funcionarios@cargpesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(979, '5a08f3b0-01f3-43e5-9e79-e3ba3b5f873a', 1, 'Casa das lonas', 'casadaslonas@cargapesada.com', 'Carga@465', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(980, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Macip', 'macip@agroplay.onmicrosoft.com', '##agr@1.2##', 'sem licença', 'Pendente', '2026-01-05 16:22:43'),
(981, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Camila', 'camila@agroplay.onmicrosoft.com', 'J/907747970893uh', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(982, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Simone', 'Simone@agroplay.onmicrosoft.com', 'C^329809880386af@', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(983, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Isa', 'Isa@agroplay.onmicrosoft.com', 'R^793511114898uk', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(984, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Valdir', 'valdir@agroplay.onmicrosoft.com', 'K%199079860068an', 'Microsoft 365 Business standard', 'Pendente', '2026-01-05 16:22:43'),
(985, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Bruno', 'bruno@agroplay.onmicrosoft.com', 'R$585759733278ub@', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(986, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Emiliana', 'emiliana@agroplay.onmicrosoft.com', 'Y*848294438498ot', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(987, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Natiele', 'natiele@agroplay.onmicrosoft.com', 'J@482536400906ud', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(988, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Caio', 'caio@agroplay.onmicrosoft.com', 'N#787308689701oj', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(989, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Eduardo', 'eduardo@agroplay.onmicrosoft.com', 'J.516671053404uf@', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(990, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Beatriz Vitorelli', 'beatriz.vitorelli@agroplay.onmicrosoft.com', 'D^091383740090uq', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(991, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Rodrigo', 'rodrigo@agroplay.onmicrosoft.com', 'V^858381041689uq', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(992, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Matheus', 'matheus@agroplay.onmicrosoft.com', 'R&035343267631oc', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(993, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Dede', 'dede@agroplay.onmicrosoft.com', 'C&256917736687ub', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(994, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Leticia Rossato', 'leticia@agroplay.onmicrosoft.com', 'S(052230213662ox', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(995, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Giovana', 'giovana@agroplay.onmicrosoft.com', 'X.476073703289ot', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(996, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'FABIO - CONTRATOS', 'compras_fabio@agroplay.onmicrosoft.com', 'W)188099050131ul', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(997, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'ADRIELLE - RH', 'rh_adrielle@agroplay.onmicrosoft.com', 'S@534470464418av', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(998, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Douglas Alessi', 'douglas.alessi@agroplay.onmicrosoft.com', 'L*917761982729oz', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-05 16:22:43'),
(999, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'João Paulo Marinho', 'projetos@agroplay.onmicrosoft.com', 'Q.180996194814on@', 'Micrososoft 365 Business Basi + Project Plan 3', 'Pendente', '2026-01-05 16:22:43'),
(1000, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Campiolo', 'powerbi01@agroplay.onmicrosoft.com', 'J@613070840115ur', 'PowerBI PRO', 'Pendente', '2026-01-05 16:22:43'),
(1001, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'PowerBi02', 'powerbi02@agroplay.onmicrosoft.com', 'Z%956720522159uy', 'PowerBI PRO', 'Pendente', '2026-01-05 16:22:43'),
(1002, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Agroplay Prod01', 'agroplayprod01@agroplay.onmicrosoft.com', 'B/385243740812u', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1003, '3a6570b8-6f7a-432d-99d1-21a3ec73bd68', 1, 'Comercial', 'comercial@agroplay.onmicrosoft.com', 'D)048515020669uf', 'PowerBI PRO', 'Pendente', '2026-01-05 16:22:43'),
(1004, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Macip', 'macip@compenfort.onmicrosoft.com', '##com@1.2##', 'sem licença', 'Pendente', '2026-01-05 16:22:43'),
(1005, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Contato Compenfort', 'contato@compenfort.com', 'X%965336358451ow', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1006, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Marcelo Penariol', 'marcelopenariol@compenfort.com', 'P@467088862240us', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1007, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Marcelo Alves', 'marceloalves@compenfort.com', 'M@426043387602uz', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1008, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Adm Compenfort', 'adm@compenfort.com', 'C.644453148313az', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1009, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Edmo Hojo', 'fiscal1@compenfort.com', 'H*190075249402om', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1010, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Adriano Compenfort', 'fiscal2@compenfort.com', 'C/538153022703ac', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1011, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Nfe Compenfort', 'nfe@compenfort.com', 'S&487173415266ut', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1012, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Compras Compenfort', 'compras@compenfort.com', 'D/283608379135uc', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1013, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Mkt Compenfort', 'mkt@compenfort.com', 'F*791814658820ap', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1014, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Gustavo Rodrigues', 'gustavorodrigues@compenfort.com', 'W!568852442629at', 'Standard', 'Pendente', '2026-01-05 16:22:43'),
(1015, 'd1e03a93-180e-498d-91ea-41f570ed00e3', 1, 'Estoque Compenfort', 'estoque@compenfort.com', 'W^195771961242ah', 'Basic', 'Pendente', '2026-01-05 16:22:43'),
(1017, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'NICKOLLE DA SILVEIRA SENA - AMARAL VASCONCELLOS', 'nickolle.sena@amaralvasconcellos.com.br', 'H(728219894792af$', 'Basic', 'Pendente', '2026-01-13 18:37:24'),
(1018, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'Eduardo Augusto Lançoni', 'vendas9@hydronlubz.com.br', ' Y/657265097935us', 'basic', 'Pendente', '2026-01-19 12:17:35'),
(1019, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'LIA MARCIA APARECIDA SCHAFHAUSER - PAVCOB', 'acordo7@pavcob.com.br', 'F%514668862412an@', 'Microsoft 365 Business Basic', 'Pendente', '2026-01-29 14:09:22'),
(1020, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ELOISA HERNANDES SALGADO - AMARAL VASCONCELLOS', 'eloisa.salgado@amaralvasconcellos.com.br', 'F*656933876942oh#', 'Microsoft 365 Business Basic', 'Pendente', '2026-02-06 16:56:45'),
(1021, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ALISSON FERNANDO RIBEIRO', 'alison.ribeiro@amaralvasconcellos.com.br', 'R.804066604882aq', 'basic', 'Pendente', '2026-02-13 18:40:31'),
(1022, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'MARCELO GARDINI', 'vendas6@hydronlubz.com.br', 'F.926905165347ax', 'standard', 'Pendente', '2026-02-20 11:09:03'),
(1023, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ARTHUR MOLINA - PAVCOB', 'arthur.molina@pavcob.com.br', 'N&779052798437ov', 'Basic', 'Pendente', '2026-02-20 12:30:22'),
(1024, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'Macip', 'macip@hidromar.com.br', '##mac@1.2##', 'Sem licença', 'Pendente', '2026-02-27 12:27:21'),
(1025, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'MACIP', 'admin@hidromar.com.br', 'Yuz5600@hidro', 'Sem licença', 'Pendente', '2026-02-27 12:29:07'),
(1026, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ADM - Log', 'backup@hidromar.com.br', 'Zur89302', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1028, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ADM - Recepção', 'nf-e@hidromar.com.br', 'Taw12842h', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1029, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ADM - Recepção', 'xml@hidromar.com.br', 'Hob73212$%%%$%@@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1031, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: COM - Sérgio Augusto', 'assistencia@hidromar.com.br', 'Sax56817', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1032, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: DIR - Lorena Fornasier', 'lorena@hidromar.com.br', 'Tuq12171', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1033, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: DIR - Margareth Fornasier', 'margareth@hidromar.com.br', 'Y!240345861598um', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1034, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ENG - Gabriel de Paula', 'engenharia@hidromar.com.br', 'L%374146297083uq', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1035, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ENG - Juliano Kleine', 'engenharia2@hidromar.com.br', 'Pak01748', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1036, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'Otávio Zanella – HIDROMAR: COM', 'compras1@hidromar.com.br', 'Boq26925', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1038, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: FIN - Marco Oliveira', 'lina@hidromar.com.br', 'Huy11289', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1039, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: FIN - Thiago Xavier', 'financeiro@hidromar.com.br', 'Hol50458$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1040, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: FIN - Thiago Xavier', 'cobranca@hidromar.com.br', 'Y.783425472028ut', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1041, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: MKT - Rita', 'marketing@hidromar.com.br', 'C!184451830060ud', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1042, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEM - Emer Gasparini', 'mercado@hidromar.com.br', 'Juv14970$h%', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1043, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: MKT - Site', 'noreply@hidromar.com.br', 'Poc35236', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1045, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: PCP - Rhofni silva', 'producao@hidromar.com.br', 'Noh52553', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1046, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: PCP - DIEGO TEODORO', 'pcp1@hidromar.com.br', 'Muv73482$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1047, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: PCP - Rodrigo Guedes', 'pcp@hidromar.com.br', 'Kaj91836$@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1049, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Ana Carolina', 'rh@hidromar.com.br', 'Ruj81317', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1050, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Caio Cesar', 'vendas6@hidromar.com.br', 'Qah94922$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1051, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Sardinha', 'comercial3@hidromar.com.br', 'Hoh62952', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1052, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Daniela Oliveira', 'comercial1@hidromar.com.br', 'Cox77177@@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1053, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Fábio Goto', 'vendas12@hidromar.com.br', 'Bud66954', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1054, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Jessika Micaella', 'vendas11@hidromar.com.br', 'Car99790', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1055, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - João Antonio', 'vendas7@hidromar.com.br', 'Z)796406710867ay', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1056, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - João Vitor', 'vendas3@hidromar.com.br', 'Maf58331', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1057, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'Victor Hugo de Menezes', 'vendas01@hidromar.com.br', 'G%612881837772og', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1058, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Kleber Case', 'vendas2@hidromar.com.br', 'Maf58331', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1059, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEM - Anderson Silva', 'vendas8@hidromar.com.br', 'V#505225071438ud', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1060, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Sandra Bertozi', 'vendas4@hidromar.com.br', 'Xar71088$%', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1062, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Sirlei Oliveira', 'vendas@hidromar.com.br', 'G/568182893663og', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1063, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Marcia Rodrigues', 'vendas9@hidromar.com.br', 'Z%318340262885up', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1064, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Vilson Ferrajam', 'vendas10@hidromar.com.br', 'Toq94206', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1065, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Vilson Ferrajam', 'promotor@hidromar.com.br', 'Qaj78294', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1066, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Karoline Oliveira', 'comercial4@hidromar.com.br', 'Gub80386hh', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1067, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN -', 'vendas14@hidromar.com.br', 'Xoh47594', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1068, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Sardinha', 'comercial@hidromar.com.br', 'Kuf13940$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1069, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'TANIA MARTINELE - HIDROMAR: VEM', 'posvenda@hidromar.com.br', 'Q%693529608515ur$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1070, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR - DANIELE PEREIRA', 'processos@hidromar.com.br', 'Gos23360', 'STANDARD', 'Pendente', '2026-02-27 12:29:07');
INSERT INTO `o365_licenses` (`id`, `client_id`, `user_id`, `username`, `email`, `password`, `license_type`, `renewal_status`, `created_at`) VALUES
(1071, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR - REGINALDO SILVEIRO', 'dp@hidromar.com.br', 'Qak91122', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1073, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Evelyn Ribeiro', 'marketing2@hidromar.com.br', 'Hoy39662', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1074, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN  - Diogenes Correa', 'vendas16@hidromar.com.br', 'Zad00079', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1075, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEM - Rafael Muniz', 'vendas5@hidromar.com.br', 'W#418902016143ad', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1076, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: MKT - Lucas de Souza', 'socialmedia@hidromar.com.br', 'B$259908215372am', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1077, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: PCP - Elyton Correia Lima', 'pcp2@hidromar.com.br', 'Cuc16945$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1079, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ENG - Henrique', 'engenharia3@hidromar.com.br', 'Y/199009584618ab', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1080, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: EXP -', 'expedicao@hidromar.com.br', 'N$043402255952og', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1081, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: ALMOXARIFADO', 'almoxarifado@hidromar.com.br', 'N!831358765564uk', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1082, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'SALA DE REUNIÕES', 'hidromar.meeting@gmail.com', 'Hidro@123@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1083, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: MKT - Webmaster', 'webmaster@hidromar.com.br', 'danfe18xml4Gf-53', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1084, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: PCP - Bruna', 'pcp3@hidromar.com.br', 'Jx8krb21@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1085, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Geral', 'hidromar@hidromar.com.br', 'Whmsg76@', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1086, '155ea8c6ebc54d463fcc5c2424de5812', 1, 'HIDROMAR: VEN - Gerência Comercial', 'gerenciacomercial@hidromar.com.br', '*0EjdXfPzG@P@$', 'STANDARD', 'Pendente', '2026-02-27 12:29:07'),
(1087, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'HELOISA FOGARE - AMARAL VASCONCELLOS', 'heloisa.fogare@amaralvasconcellos.com.br', 'V(791375269183us@', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-03 16:40:52'),
(1088, '155ea8c6ebc54d463fcc5c2424de5812', 3, 'HIDROMAR: VEN - Mario Eduardo Oyamada', 'vendas15@hidromar.com.br', 'G(293599026156uh', 'STANDARD', 'Pendente', '2026-03-04 14:17:36'),
(1089, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'BEATRIZ NANTES - AMARAL VASCONCELLOS', 'beatriz.nantes@amaralvasconcellos.com.br', ' D#669543582544ab', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-05 18:00:36'),
(1090, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GUILHERME DE ASSIS FURTADO - AMARAL VASCONCELLOS', 'guilherme.furtado@amaralvasconcellos.com.br', 'S)535976955771aw@', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-09 14:02:26'),
(1091, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'ANA JULLIA DOS SANTOS - PAVCOB', 'acordo4@pavcob.com.br', 'F(584562590817uc', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-12 13:47:13'),
(1092, '597085c1-924e-43d0-afcc-1c9f87ec07ea', 1, 'Pamela Katiana de Souza Miranda ', 'vendas7@hydronlubz.com.br', 'R.533869008309us@', 'Basic', 'Pendente', '2026-03-13 17:56:28'),
(1093, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'MATIAS SOARES FURLANETO - AMARAL VASCONCELLOS', 'matias.furlaneto@amaralvasconcellos.com.br', 'K/678899283134az', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-18 17:00:08'),
(1094, 'cc790247-497e-4eb5-9333-b2ac09a23261', 2, ' ALAIN OLIVEIRA SANTOS - AMARAL VASCONCELLOS', 'alain.santos@amaralvasconcellos.com.br', 'K%067326071895oz@', 'Microsoft 365 Business Basic', 'Pendente', '2026-03-26 19:24:54'),
(1095, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'VINICIUS FELIPE STOCHI DA SILVA', 'auxadm@supersantarem.onmicrosoft.com', 'R@876793469266ov$', 'Standard', 'Pendente', '2026-04-01 11:09:57'),
(1096, '2a14476f-244e-4f40-ad7b-423fa3db990e', 1, 'BEATRIZ ABREU SUEMATO', 'mkt@supersantarem.onmicrosoft.com', 'D(007248000283ux$', 'Standard', 'Pendente', '2026-04-01 11:11:14'),
(1097, 'cc790247-497e-4eb5-9333-b2ac09a23261', 2, 'LAURA FURTADO CARMINHOLA - AMARAL VASCONCELLOS', 'laura.furtado@amaralvasconcellos.com.br', 'T(634592488128ut', 'Microsoft 365 Business Basic', 'Pendente', '2026-04-01 19:38:51'),
(1098, 'cc790247-497e-4eb5-9333-b2ac09a23261', 2, 'DANIELA POLI MIGNONI - AMARAL VASCONCELLOS', 'daniela.mignoni@amaralvasconcellos.com.br', 'Q.611115644410ah', 'Microsoft 365 Business Basic', 'Pendente', '2026-04-07 13:39:54'),
(1099, 'cc790247-497e-4eb5-9333-b2ac09a23261', 2, 'VIVIANA DE MORAIS - PAVCOB', 'acordo6@pavcob.com.br', 'P(557593978770al', 'Microsoft 365 Empresas Basic', 'Pendente', '2026-04-13 11:26:29'),
(1100, 'cc790247-497e-4eb5-9333-b2ac09a23261', 1, 'GABRIELA ADRIANI DE PAULA GARCIA - PAVCOB', 'acordo9@pavcob.com.br', 'L$066933558370us$', 'Microsoft 365 Business Basic', 'Pendente', '2026-04-22 13:04:00'),
(1101, 'cc790247-497e-4eb5-9333-b2ac09a23261', 3, 'PABLO MARTINS - AMARAL VASCONCELLOS', 'pablo.martins@amaralvasconcellos.com.br', 'Y#871704729447ay', 'Basic', 'Pendente', '2026-04-23 13:29:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `storage_devices`
--

CREATE TABLE `storage_devices` (
  `id` int(11) NOT NULL,
  `hardware_id` int(11) NOT NULL,
  `type` enum('SSD','HDD','NVMe','M.2') COLLATE utf8_unicode_ci NOT NULL,
  `capacity` int(11) NOT NULL COMMENT 'Em GB',
  `manufacturer` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `model` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `interface` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `storage_devices`
--

INSERT INTO `storage_devices` (`id`, `hardware_id`, `type`, `capacity`, `manufacturer`, `model`, `interface`) VALUES
(1, 1, 'NVMe', 512, 'Samsung', NULL, 'PCIe 4.0'),
(2, 2, 'SSD', 256, 'Kingston', NULL, 'SATA'),
(3, 3, 'SSD', 480, 'Samsung', NULL, 'SATA'),
(4, 3, 'HDD', 2000, 'Seagate', NULL, 'SATA');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `two_factor_secret` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `role` varchar(50) COLLATE utf8_unicode_ci DEFAULT 'user',
  `permissions` longtext COLLATE utf8_unicode_ci,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `created_at`, `two_factor_secret`, `two_factor_enabled`, `role`, `permissions`, `is_active`, `last_login`) VALUES
(1, 'suporte@macip.com.br', '$2a$12$jSDNiEYvAhCTV19vtfFZh.XW7EbjOqHujakE81kvMN4xP82dTElwG', '2025-12-19 14:29:58', 'LZ37DP4S6GIY5DCS', 1, 'admin', '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"actions\":{\"edit\":true,\"delete\":true},\"client_access_all\":true,\"client_access\":{\"bitdefender\":[],\"fortigate\":[],\"o365\":[],\"gmail\":[]}}', 1, NULL),
(2, 'suporte02@macip.com.br', '$2y$10$0O7GEaaR7pP66cL.rrWuquCrP2Y9WjzJknhxkwj7nYZ2WAHAvXmve', '2026-01-05 16:48:24', 'R2U6FG4F6B3R5OOE', 1, 'admin', '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"actions\":{\"edit\":true,\"delete\":false},\"client_access_all\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"client_access\":{\"bitdefender\":[],\"fortigate\":[],\"o365\":[],\"gmail\":[]}}', 1, '2026-03-18 17:21:20'),
(3, 'suporte01@macip.com.br', '$2y$10$eNelyvPmqYdD9ccPGkcqPeVAKbEVKU3xmM0c9kpR5VHpa1KpU1e92', '2026-01-05 18:06:46', NULL, 0, 'admin', '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"actions\":{\"edit\":true,\"delete\":true},\"client_access_all\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"client_access\":{\"bitdefender\":[],\"fortigate\":[],\"o365\":[],\"gmail\":[]}}', 1, '2026-04-23 16:12:51'),
(4, 'ronaldo@macip.com.br', '$2y$10$uNcwtQNTl1Tva7JE.JsSXeNo2.2YxADGsOh9fOGfEWODvZg3B/NbC', '2026-01-13 17:23:50', NULL, 0, 'admin', '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"actions\":{\"edit\":true,\"delete\":true},\"client_access_all\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":true,\"network\":true},\"client_access\":{\"bitdefender\":[],\"fortigate\":[],\"o365\":[],\"gmail\":[]}}', 1, '2026-04-23 11:37:17'),
(5, 'bruna@amaralvasconcellos.com.br', '$2y$10$V4gDawUzUpPtPzAg0wAUAelkA6cqWGg6VVY/g2/XYmM3dNgsRjiH2', '2026-01-13 19:01:18', NULL, 0, 'user', '{\"dashboards\":{\"bitdefender\":true,\"fortigate\":true,\"o365\":true,\"gmail\":false,\"network\":false},\"actions\":{\"edit\":true,\"delete\":true},\"client_access_all\":{\"bitdefender\":false,\"fortigate\":false,\"o365\":false,\"gmail\":false,\"network\":true},\"client_access\":{\"bitdefender\":[\"AMARAL VASCONCELLOS\"],\"fortigate\":[\"AMARAL VASCONCELLOS\"],\"o365\":[\"cc790247-497e-4eb5-9333-b2ac09a23261\"],\"gmail\":[]}}', 0, NULL);

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `bitdefender_api_config`
--
ALTER TABLE `bitdefender_api_config`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `bitdefender_licenses`
--
ALTER TABLE `bitdefender_licenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `license_key` (`license_key`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_client_api` (`client_api_key`);

--
-- Índices de tabela `bitdefender_sync_log`
--
ALTER TABLE `bitdefender_sync_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created` (`created_at`);

--
-- Índices de tabela `email_history`
--
ALTER TABLE `email_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `fortigate_devices`
--
ALTER TABLE `fortigate_devices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `serial` (`serial`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `gmail_clients`
--
ALTER TABLE `gmail_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `gmail_licenses`
--
ALTER TABLE `gmail_licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `hardware_devices`
--
ALTER TABLE `hardware_devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_client` (`client_name`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_warranty` (`warranty_expiration`);

--
-- Índices de tabela `network_diagrams`
--
ALTER TABLE `network_diagrams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `o365_clients`
--
ALTER TABLE `o365_clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `o365_licenses`
--
ALTER TABLE `o365_licenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Índices de tabela `storage_devices`
--
ALTER TABLE `storage_devices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hardware_id` (`hardware_id`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `bitdefender_licenses`
--
ALTER TABLE `bitdefender_licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT de tabela `bitdefender_sync_log`
--
ALTER TABLE `bitdefender_sync_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `email_history`
--
ALTER TABLE `email_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `fortigate_devices`
--
ALTER TABLE `fortigate_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT de tabela `gmail_licenses`
--
ALTER TABLE `gmail_licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT de tabela `hardware_devices`
--
ALTER TABLE `hardware_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `network_diagrams`
--
ALTER TABLE `network_diagrams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `o365_licenses`
--
ALTER TABLE `o365_licenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1102;

--
-- AUTO_INCREMENT de tabela `storage_devices`
--
ALTER TABLE `storage_devices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `bitdefender_licenses`
--
ALTER TABLE `bitdefender_licenses`
  ADD CONSTRAINT `bitdefender_licenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `email_history`
--
ALTER TABLE `email_history`
  ADD CONSTRAINT `email_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `fortigate_devices`
--
ALTER TABLE `fortigate_devices`
  ADD CONSTRAINT `fortigate_devices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `gmail_clients`
--
ALTER TABLE `gmail_clients`
  ADD CONSTRAINT `gmail_clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `gmail_licenses`
--
ALTER TABLE `gmail_licenses`
  ADD CONSTRAINT `gmail_licenses_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `gmail_clients` (`id`),
  ADD CONSTRAINT `gmail_licenses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `network_diagrams`
--
ALTER TABLE `network_diagrams`
  ADD CONSTRAINT `network_diagrams_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `o365_clients`
--
ALTER TABLE `o365_clients`
  ADD CONSTRAINT `o365_clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `o365_licenses`
--
ALTER TABLE `o365_licenses`
  ADD CONSTRAINT `o365_licenses_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `o365_clients` (`id`),
  ADD CONSTRAINT `o365_licenses_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Restrições para tabelas `storage_devices`
--
ALTER TABLE `storage_devices`
  ADD CONSTRAINT `storage_devices_ibfk_1` FOREIGN KEY (`hardware_id`) REFERENCES `hardware_devices` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
