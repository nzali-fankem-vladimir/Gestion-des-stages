-- Script pour ajouter la colonne actif à la table utilisateur
-- Exécutez ce script manuellement dans votre base de données PostgreSQL

-- Ajouter la colonne actif si elle n'existe pas déjà
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'utilisateur' AND column_name = 'actif') THEN
        ALTER TABLE utilisateur ADD COLUMN actif BOOLEAN NOT NULL DEFAULT FALSE;
        RAISE NOTICE 'Colonne actif ajoutée avec succès';
    ELSE
        RAISE NOTICE 'La colonne actif existe déjà';
    END IF;
END $$;

-- Activer tous les admins existants
UPDATE utilisateur SET actif = TRUE 
WHERE role_id = (SELECT id FROM roles WHERE name = 'ADMIN');

-- Vérifier le résultat
SELECT email, actif FROM utilisateur;
