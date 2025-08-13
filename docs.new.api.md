📚 API PlusCode - Documentation
🌐 URL de base
http://BI.LEWOOTRACK.COM:5001/api/pluscode
🔧 Endpoints disponibles
1. ✅ Vérifier l'état de l'API
GET /health
curl http://BI.LEWOOTRACK.COM:5001/health
Réponse :
{
  "status": "ok",
  "service": "pluscode-api"
}
2. 🔍 Vérifier si un PlusCode existe déjà
POST /check
Vérifie si un couple (plus_code, tag) existe déjà dans la base.

Requête :
{
  "plus_code": "8FVC9G8F+XX",
  "tag": "bureau"
}
Exemple :
curl -X POST http://BI.LEWOOTRACK.COM:5001/api/pluscode/check \
  -H "Content-Type: application/json" \
  -d '{"plus_code": "8FVC9G8F+XX", "tag": "bureau"}'
Réponses :

200 Success :
{
  "exists": true
}
ou
{
  "exists": false
}
400 Bad Request :
{
  "error": "plus_code requis"
}
3. 📥 Insérer un PlusCode
POST /insert
Insère un nouveau PlusCode avec géocodage automatique.

Requête :
{
  "plus_code": "8FVC9G8F+XX",
  "tag": "bureau",
  "custom_fields": {
    "description": "Siège social",
    "categorie": "entreprise"
  }
}
Exemple :
curl -X POST http://BI.LEWOOTRACK.COM:5001/api/pluscode/insert \
  -H "Content-Type: application/json" \
  -d '{
    "plus_code": "8FVC9G8F+XX",
    "tag": "bureau",
    "custom_fields": {
      "description": "Siège social"
    }
  }'
Réponses :

201 Created (Succès) :
{
  "success": true,
  "message": "Plus code inséré avec succès",
  "data": {
    "plus_code": "8FVC9G8F+XX",
    "tag": "bureau",
    "address": "Sihlfeld|Zurich|District de Zurich|Zurich"
  }
}
409 Conflict (Doublon) :
{
  "error": "duplicate",
  "message": "Le couple (plus_code=8FVC9G8F+XX, tag=bureau) existe déjà.",
  "plus_code": "8FVC9G8F+XX",
  "tag": "bureau"
}
400 Bad Request :
{
  "error": "plus_code requis"
}
ou
{
  "error": "Code Plus invalide"
}
400 Geocoding Error :
{
  "error": "Impossible de géocoder le code"
}