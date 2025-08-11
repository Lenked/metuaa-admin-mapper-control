---

  Documentation de l'API de Validation Metuaa

  Informations Générales

  URL de base : Toutes les URL de cette documentation sont relatives à l'URL de votre serveur. Par exemple :
  http://VOTRE_SERVEUR:PORT

  Authentification : Chaque requête doit inclure une clé d'API valide dans les en-têtes pour être acceptée.

  Format des données : Toutes les requêtes et réponses sont au format application/json.

  ---

  Flux de Travail Recommandé pour le Frontend

  Pour une expérience utilisateur fluide, voici le flux de travail suggéré :

   1. Chargement initial : Au chargement de la page principale, appelez immédiatement GET /api/pois/all pour afficher la
      liste de tous les POIs déjà présents en base. L'interface n'est ainsi jamais vide.
   2. Démarrage de la synchronisation : Lancez la synchronisation en arrière-plan en appelant POST
      /api/pois/sync-from-odoo.
   3. Polling du statut : Après avoir lancé la synchronisation, interrogez le point de terminaison GET
      /api/pois/sync-status toutes les 5 à 10 secondes pour savoir où en est le processus.
   4. Mise à jour de l'interface :
       * Si le statut est "success", le polling s'arrête. Rafraîchissez la liste des POIs en rappelant GET /api/pois/all
         (ou GET /api/pois/pending si vous voulez voir uniquement les nouveaux).
       * Si le statut est "error", arrêtez le polling et affichez un message d'erreur à l'utilisateur.
       * Tant que le statut est "running", continuez le polling et affichez un indicateur visuel (ex: "Synchronisation en
         cours...").

  ---

  1. Synchronisation des Données (Asynchrone)

  Ce processus permet de récupérer les données depuis Odoo sans bloquer l'interface utilisateur.

  1.1. Lancer la Synchronisation

  Déclenche le processus de synchronisation en arrière-plan sur le serveur. La réponse est immédiate.

   * Endpoint : POST /api/pois/sync-from-odoo
   * Description : Lance une tâche de fond qui récupère les POIs depuis Odoo et les sauvegarde dans la base de données
     locale.
   * Réponse Succès (202 Accepted) :

   1     {
   2       "message": "La synchronisation a été lancée en arrière-plan."
   3     }
   * Réponse Erreur (409 Conflict) :
       * Renvoyée si une synchronisation est déjà en cours.

   1     {
   2       "detail": "Une synchronisation est déjà en cours."
   3     }

  1.2. Obtenir le Statut de la Synchronisation

  Permet de savoir où en est la tâche de fond. C'est le point de terminaison à appeler en boucle (polling).

   * Endpoint : GET /api/pois/sync-status
   * Description : Récupère le statut actuel de la tâche de synchronisation.
   * Réponse Succès (200 OK) :
       * Le champ status peut avoir les valeurs suivantes :
           * idle: Aucune tâche n'a été lancée récemment.
           * running: La synchronisation est en cours.
           * success: La dernière synchronisation s'est terminée avec succès.
           * error: La dernière synchronisation a échoué.

   1     {
   2       "status": "success",
   3       "last_run_start": "2023-10-27T10:30:00.123Z",
   4       "last_run_end": "2023-10-27T10:31:15.456Z",
   5       "error_message": null
   6     }

  ---

  2. Récupération des Points d'Intérêt (Listes)

  2.1. Lister TOUS les POIs (Recommandé pour le premier affichage)

  Récupère tous les POIs de la base de données locale, sans filtre de statut. Idéal pour peupler l'interface
  rapidement.

   * Endpoint : GET /api/pois/all
   * Paramètres (Query) :
       * skip (optionnel, int, défaut: 0) : Nombre d'éléments à sauter pour la pagination.
       * limit (optionnel, int, défaut: 100) : Nombre maximum d'éléments à retourner.
   * Réponse Succès (200 OK) :
       * Une liste d'objets POI.

    1     [
    2       {
    3         "id": 1,
    4         "name": "Tour Eiffel",
    5         "latitude": 48.8584,
    6         "longitude": 2.2945,
    7         "validation_status": "validated",
    8         "images": [
    9           { "id": 1, "image_url": "http://example.com/image.jpg" }
   10         ]
   11       }
   12     ]

  2.2. Lister les POIs par Statut

  Points de terminaison pour filtrer les POIs par leur statut de validation. Tous supportent la pagination (skip et
  limit).

   * En attente : GET /api/pois/pending
   * Approuvés : GET /api/pois/approved
   * Rejetés : GET /api/pois/rejected

  ---

  3. Validation des Points d'Intérêt

  Actions pour approuver ou rejeter un POI.

  3.1. Approuver un POI

   * Endpoint : POST /api/validation/pois/{poi_id}/approve
   * Paramètres (Path) :
       * poi_id (int) : L'ID du POI à approuver.
   * Corps de la requête (Body) :

   1     {
   2       "validated_by": "ID_de_l_admin_ou_nom",
   3       "ip_address": "192.168.1.10"
   4     }
   * Réponse Succès (200 OK) : L'objet POI mis à jour.

  3.2. Rejeter un POI

   * Endpoint : POST /api/validation/pois/{poi_id}/reject
   * Paramètres (Path) :
       * poi_id (int) : L'ID du POI à rejeter.
   * Corps de la requête (Body) :

   1     {
   2       "rejection_reason": "La photo n'est pas claire.",
   3       "validated_by": "ID_de_l_admin_ou_nom",
   4       "ip_address": "192.168.1.10"
   5     }
   * Réponse Succès (200 OK) : L'objet POI mis à jour.