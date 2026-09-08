CREATE DATABASE IF NOT EXISTS eventhub
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE eventhub;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS usuario_interesses;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS inscricoes;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,

    foto_url VARCHAR(500) NULL,
    bio VARCHAR(500) NULL,
    cidade VARCHAR(100) NULL,
    site VARCHAR(255) NULL,
    instagram VARCHAR(255) NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    slug VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NOT NULL,
    data DATE NOT NULL,
    local VARCHAR(150) NOT NULL,

    categoria_id INT NOT NULL,
    organizador_id INT NOT NULL,

    imagem_url VARCHAR(500) NULL,

    tipo_ingresso ENUM('gratuito', 'pago')
        NOT NULL
        DEFAULT 'gratuito',

    preco DECIMAL(10,2) NULL,
    link_ingresso VARCHAR(500) NULL,
    cupom VARCHAR(50) NULL,
    vagas INT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_eventos_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_eventos_organizador
        FOREIGN KEY (organizador_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_eventos_vagas
        CHECK (vagas IS NULL OR vagas > 0),

    CONSTRAINT chk_eventos_preco
        CHECK (preco IS NULL OR preco >= 0),

    CONSTRAINT chk_eventos_tipo_ingresso
        CHECK (
            (
                tipo_ingresso = 'gratuito'
                AND preco IS NULL
                AND link_ingresso IS NULL
            )
            OR
            (
                tipo_ingresso = 'pago'
                AND preco IS NOT NULL
                AND preco >= 0
                AND link_ingresso IS NOT NULL
            )
        )
);

CREATE TABLE inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_inscricoes_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inscricoes_evento
        FOREIGN KEY (evento_id)
        REFERENCES eventos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_inscricoes_usuario_evento
        UNIQUE (usuario_id, evento_id)
);

CREATE TABLE favoritos (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_favoritos_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_favoritos_evento
        FOREIGN KEY (evento_id)
        REFERENCES eventos(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_favoritos_usuario_evento
        UNIQUE (usuario_id, evento_id)
);

CREATE TABLE usuario_interesses (
    id INT AUTO_INCREMENT PRIMARY KEY,

    usuario_id INT NOT NULL,
    categoria_id INT NOT NULL,

    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_interesses_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_interesses_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_interesses_usuario_categoria
        UNIQUE (usuario_id, categoria_id)
);

CREATE INDEX idx_eventos_data
    ON eventos(data);

CREATE INDEX idx_eventos_categoria
    ON eventos(categoria_id);

CREATE INDEX idx_eventos_organizador
    ON eventos(organizador_id);

CREATE INDEX idx_eventos_tipo_ingresso
    ON eventos(tipo_ingresso);

CREATE INDEX idx_inscricoes_evento
    ON inscricoes(evento_id);

CREATE INDEX idx_favoritos_usuario
    ON favoritos(usuario_id);

CREATE INDEX idx_interesses_usuario
    ON usuario_interesses(usuario_id);