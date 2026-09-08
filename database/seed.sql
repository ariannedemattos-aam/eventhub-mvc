USE eventhub;

INSERT INTO categorias (nome, slug)
VALUES
    ('Networking', 'networking'),
    ('Festivais', 'festivais'),
    ('Shows', 'shows'),
    ('Tecnologia', 'tecnologia'),
    ('Educação', 'educacao'),
    ('Negócios', 'negocios'),
    ('Cultura', 'cultura'),
    ('Esportes', 'esportes'),
    ('Gastronomia', 'gastronomia'),
    ('Outros', 'outros')
ON DUPLICATE KEY UPDATE
    nome = VALUES(nome);