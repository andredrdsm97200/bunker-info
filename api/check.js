// api/check.js — Backend proxy sécurisé Bunker
// La clé Anthropic reste ici, côté serveur — jamais exposée au navigateur.
// Déployé sur Vercel comme Serverless Function.

export default async function handler(req, res) {
  // CORS — autorise uniquement les requêtes depuis votre propre domaine
  res.setHeader('Access-Control-Allow-Origin', '*'); // Remplacez * par votre URL en prod
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { query, type } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Paramètre "query" manquant' });
  }

  // La clé est lue depuis les variables d'environnement Vercel — jamais en dur
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API non configurée sur le serveur' });
  }

  // Sélection du prompt selon le type de requête
  const prompts = {
    factcheck: {
      system: `Tu es le moteur de fact-checking de Bunker, un site de vérification de l'information. Analyse l'affirmation soumise avec rigueur et bienveillance. Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks.

Format exact :
{
  "verdict": "true" | "false" | "partial",
  "label": "✓ Vrai" | "✕ Faux" | "~ Partiel",
  "confidence": "Confiance : XX%",
  "explanation": "Explication claire, factuelle et pédagogique en 3-5 phrases en français.",
  "sources": ["Source 1", "Source 2", "Source 3", "Source 4"]
}

Règles : true = consensus des sources fiables · false = contredit par les sources fiables · partial = partiellement vrai ou nécessite du contexte. Sources = institutions reconnues uniquement.`,
      user: `Affirmation à vérifier : "${query}"`
    },

    trending: {
      system: `Génère 6 fact-checks d'actualité pour le site Bunker. Réponds UNIQUEMENT en JSON valide, sans markdown.
Format : [{"t":"Catégorie","v":"true"|"false"|"partial","h":"Affirmation entre guillemets","s":"Analyse 1-2 phrases","time":"Il y a Xh","c":"🇫🇷 Pays"}]
Couvre : politique, santé, technologie, climat, science, économie. Sois factuel, varié et pédagogique.`,
      user: `Génère 6 fact-checks d'actualité récents.`
    }
  };

  const prompt = prompts[type] || prompts.factcheck;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1500,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic error:', err);
      return res.status(response.status).json({ error: 'Erreur API Anthropic', detail: err });
    }

    const data = await response.json();
    const text = data.content
      .map(b => b.text || '')
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    // Renvoie le JSON parsé au frontend
    const parsed = JSON.parse(text);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Erreur serveur',
      verdict: 'partial',
      label: '~ Indéterminé',
      confidence: 'N/A',
      explanation: 'Analyse indisponible pour le moment. Connexion instable ou information trop récente. Consultez directement les sources officielles.',
      sources: ['Erreur de connexion']
    });
  }
}
