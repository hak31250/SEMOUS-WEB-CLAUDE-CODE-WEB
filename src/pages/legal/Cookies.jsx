export default function Cookies() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-sm">
      <h1>Politique cookies</h1>

      <h2>Qu'est-ce qu'un cookie ?</h2>
      <p>Un cookie est un petit fichier stocké sur votre appareil lors de la visite d'un site web. Il permet de mémoriser vos préférences et d'améliorer votre expérience.</p>

      <h2>Cookies utilisés</h2>
      <table>
        <thead><tr><th>Cookie</th><th>Finalité</th><th>Durée</th></tr></thead>
        <tbody>
          <tr><td>semous-cart</td><td>Mémorisation du panier</td><td>Session</td></tr>
          <tr><td>sb-*</td><td>Authentification Supabase</td><td>1 semaine</td></tr>
          <tr><td>semous-cookie-consent</td><td>Mémorisation de votre choix cookies</td><td>1 an</td></tr>
        </tbody>
      </table>

      <h2>Gestion des cookies</h2>
      <p>Vous pouvez à tout moment modifier vos préférences en matière de cookies via le bandeau cookies disponible sur le site, ou en modifiant les paramètres de votre navigateur.</p>

      <h2>Cookies tiers</h2>
      <p>En V1, aucun cookie tiers de tracking ou de publicité n'est utilisé sur semous.fr.</p>
    </div>
  )
}
