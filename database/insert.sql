INSERT INTO
    User (
        Nom,
        Prenom,
        Email,
        Mot_de_passe,
        IsActive
    )
VALUES (
        'Dupont',
        'Jean',
        'jean.dupont@example.com',
        'hashedpwd1',
        TRUE
    ),
    (
        'Martin',
        'Sophie',
        'sophie.martin@example.com',
        'hashedpwd2',
        TRUE
    ),
    (
        'Bernard',
        'Lucas',
        'lucas.bernard@example.com',
        'hashedpwd3',
        TRUE
    ),
    (
        'Moreau',
        'Emma',
        'emma.moreau@example.com',
        'hashedpwd4',
        TRUE
    ),
    (
        'Petit',
        'Hugo',
        'hugo.petit@example.com',
        'hashedpwd5',
        TRUE
    );

INSERT INTO
    Parametre_User (
        Id_User,
        Notification_Mail,
        Langue
    )
VALUES (1, TRUE, 'fr'),
    (2, FALSE, 'en'),
    (3, TRUE, 'fr'),
    (4, TRUE, 'es'),
    (5, FALSE, 'fr');

INSERT INTO
    Document (
        Id_User,
        Nom_document,
        Chemin_stockage,
        Tailles_MB,
        IsActive
    )
VALUES (
        1,
        'CV_Jean.pdf',
        '/storage/docs/CV_Jean.pdf',
        1.2,
        TRUE
    ),
    (
        2,
        'Contrat_Sophie.docx',
        '/storage/docs/Contrat_Sophie.docx',
        0.8,
        TRUE
    ),
    (
        3,
        'Facture_Lucas.pdf',
        '/storage/docs/Facture_Lucas.pdf',
        0.5,
        TRUE
    ),
    (
        4,
        'Rapport_Emma.pdf',
        '/storage/docs/Rapport_Emma.pdf',
        2.3,
        TRUE
    ),
    (
        5,
        'Note_Hugo.txt',
        '/storage/docs/Note_Hugo.txt',
        0.1,
        TRUE
    );

INSERT INTO
    Parametre_Document (
        Id_Document,
        Protection_MotDePasse,
        Mot_de_passe,
        Date_Expiration
    )
VALUES (1, FALSE, NULL, NULL),
    (
        2,
        TRUE,
        'docpwd123',
        '2025-12-31 23:59:59'
    ),
    (3, FALSE, NULL, NULL),
    (
        4,
        TRUE,
        'secure2025',
        '2026-01-15 00:00:00'
    ),
    (5, FALSE, NULL, NULL);

INSERT INTO
    Lien (
        Id_Document,
        Code_unique,
        URL,
        Nb_Acces,
        IsActive,
        Date_Expiration
    )
VALUES (
        1,
        'AA11BB22',
        'https://trans.it/download/AA11BB22',
        0,
        TRUE,
        '2025-06-01 00:00:00'
    ),
    (
        2,
        'CC33DD44',
        'https://trans.it/download/CC33DD44',
        2,
        TRUE,
        '2025-07-10 00:00:00'
    ),
    (
        3,
        'EE55FF66',
        'https://trans.it/download/EE55FF66',
        5,
        TRUE,
        NULL
    ),
    (
        4,
        'GG77HH88',
        'https://trans.it/download/GG77HH88',
        1,
        TRUE,
        '2025-04-12 00:00:00'
    ),
    (
        5,
        'II99JJ00',
        'https://trans.it/download/II99JJ00',
        0,
        TRUE,
        NULL
    );

INSERT INTO
    Historique (Id_Lien, Action, Adresse_IP)
VALUES (
        1,
        'Lien généré',
        '192.168.1.10'
    ),
    (
        2,
        'Accès au lien',
        '192.168.1.15'
    ),
    (
        3,
        'Téléchargement effectué',
        '10.0.0.25'
    ),
    (
        4,
        'Lien consulté',
        '172.16.5.33'
    ),
    (
        5,
        'Lien généré',
        '192.168.0.55'
    );