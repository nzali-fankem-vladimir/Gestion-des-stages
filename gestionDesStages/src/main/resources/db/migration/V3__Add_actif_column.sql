-- Ajout de la colonne actif à la table utilisateur
ALTER TABLE utilisateur ADD COLUMN actif BOOLEAN NOT NULL DEFAULT FALSE;

-- Activer tous les admins existants
UPDATE utilisateur SET actif = TRUE 
WHERE role_id = (SELECT id FROM roles WHERE name = 'ADMIN');
