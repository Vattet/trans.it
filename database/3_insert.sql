use transit;

INSERT INTO
    User (
        ID,
        Nom,
        Prenom,
        Email,
        Mot_de_passe,
        IsActive,
        IsAdmin,
        Date_Update,
        Date_Creation
    )
VALUES (
        9,
        'Anonyme',
        'Guest',
        'Anonyme',
        '$2y$10$UnusablePasswordHashForSecurityReasons__________________',
        1,
        1,
        '2025-11-24 14:47:28',
        '2025-11-24 14:47:28'
    );