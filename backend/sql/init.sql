CREATE DATABASE IF NOT EXISTS `db_integrador`
  CHARACTER SET = 'utf8mb4'
  COLLATE = 'utf8mb4_unicode_ci';
USE `db_integrador`;

-- ==================================================================
-- Tabela: avatars
-- Guarda referência ao arquivo no repositório e uma URL pública relativa
-- ==================================================================
CREATE TABLE IF NOT EXISTS `avatars` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(120) NOT NULL,
  `caminho_imagem` VARCHAR(512) NOT NULL,
  `public_url` VARCHAR(512) DEFAULT NULL,
  `desbloqueado_por_pontos` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_avatars_caminho` (`caminho_imagem`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================================================================
-- Tabela: rewards (recompensas / gamificação)
-- ==================================================================
CREATE TABLE IF NOT EXISTS `rewards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(120) NOT NULL,
  `descricao` TEXT,
  `imagem` VARCHAR(512) DEFAULT NULL,
  `pontos_necessarios` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_rewards_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================================================================
-- Tabela: users
-- Armazena usuários (crianças, pais, admins). Senha armazenada como hash bcrypt.
-- ==================================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `nome` VARCHAR(120) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `avatar_id` INT UNSIGNED DEFAULT NULL,
  `tipo_usuario` ENUM('child','parent','admin') DEFAULT 'child',
  `data_criacao` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `ux_users_email` (`email`),
  INDEX `idx_users_tipo` (`tipo_usuario`),
  INDEX `idx_users_avatar` (`avatar_id`),
  CONSTRAINT `fk_users_avatar` FOREIGN KEY (`avatar_id`) REFERENCES `avatars`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================================================================
-- Tabela: quiz_questions
-- Opcional: armazena perguntas caso queira migrar perguntas do frontend
-- Columns: opcoes em JSON (array de strings)
-- ==================================================================
CREATE TABLE IF NOT EXISTS `quiz_questions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `phase` VARCHAR(64) NOT NULL,
  `quiz_id` VARCHAR(64) DEFAULT NULL,
  `external_id` VARCHAR(128) DEFAULT NULL,
  `pergunta` TEXT NOT NULL,
  `opcoes` JSON NOT NULL,
  `resposta_correta` VARCHAR(255) NOT NULL,
  `source` ENUM('seed','custom') DEFAULT 'seed',
  `approved` BOOLEAN DEFAULT TRUE,
  `author_id` INT UNSIGNED DEFAULT NULL,
  `dificuldade` TINYINT UNSIGNED DEFAULT NULL,
  `categoria` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_phase` (`phase`),
  INDEX `idx_quiz_id` (`quiz_id`),
  INDEX `idx_approved` (`approved`),
  CONSTRAINT `fk_quiz_questions_author` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================================================================
-- Tabela: quiz_results
-- Registra tentativas e estatísticas por usuário
-- ==================================================================
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `quiz_id` VARCHAR(64) DEFAULT NULL,
  `score` INT NOT NULL,
  `total_acertos` INT NOT NULL,
  `tempo_gasto` INT UNSIGNED DEFAULT 0,
  `detalhes` JSON DEFAULT NULL,
  `data` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_quiz_results_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_quiz_id` (`quiz_id`),
  INDEX `idx_data` (`data`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==================================================================
-- Tabela: user_rewards
-- Relação entre usuário e recompensas conquistadas
-- ==================================================================
CREATE TABLE IF NOT EXISTS `user_rewards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `reward_id` INT UNSIGNED NOT NULL,
  `data_conquista` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_rewards_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_rewards_reward` FOREIGN KEY (`reward_id`) REFERENCES `rewards`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `ux_user_reward` (`user_id`,`reward_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================================================================
-- Tabela: refresh_tokens
-- Guarda refresh tokens para permitir renovação de access tokens
-- ==================================================================
CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(128) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `revoked` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_refresh_user` (`user_id`),
  UNIQUE KEY `uk_refresh_token_hash` (`token_hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `user_progress` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NOT NULL,
  `progress` JSON DEFAULT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `ux_user_id` (`user_id`),
  CONSTRAINT `fk_user_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




DELETE a1 FROM avatars a1
INNER JOIN avatars a2 
WHERE 
  SUBSTRING_INDEX(a1.caminho_imagem, '/', -1) = SUBSTRING_INDEX(a2.caminho_imagem, '/', -1)
  AND a1.id > a2.id;


INSERT INTO avatars (id, nome, caminho_imagem, public_url, desbloqueado_por_pontos) VALUES
  (1, 'Capitão Economix', '/avatars/avatar1-a.png', '/avatars/avatar1-a.png', 0),
  (2, 'Super Poupança', '/avatars/avatar4.png', '/avatars/avatar4.png', 0),
  (3, 'Super Controle', '/avatars/avatar2.png', '/avatars/avatar2.png', 0),
  (4, 'Super Investidora', '/avatars/avatar4-a.png', '/avatars/avatar4-a.png', 0)
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  caminho_imagem = VALUES(caminho_imagem),
  public_url = VALUES(public_url),
  desbloqueado_por_pontos = VALUES(desbloqueado_por_pontos);


-- Nota: Para criar usuários use o endpoint POST /api/auth/register (ele já faz hashing bcrypt da senha).

