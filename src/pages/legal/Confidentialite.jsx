export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose prose-sm">
      <h1>Politique de confidentialité</h1>
      <p className="text-semous-gray-text text-sm">Dernière mise à jour : mai 2025</p>

      <h2>1. Identité du responsable de traitement</h2>
      <p>
        Le responsable du traitement de vos données personnelles est :<br />
        <strong>SEMOUS</strong><br />
        32 avenue Honoré Serres, 31000 Toulouse, France<br />
        Téléphone : +33 6 23 23 36 77<br />
        Email : contact@semous.fr
      </p>

      <h2>2. Données collectées</h2>
      <p>Dans le cadre de la gestion de vos commandes, SEMOUS collecte uniquement les données strictement nécessaires :</p>
      <ul>
        <li><strong>Données d&apos;identification</strong> : prénom, nom</li>
        <li><strong>Coordonnées</strong> : adresse e-mail, numéro de téléphone</li>
        <li><strong>Adresse de livraison</strong> : uniquement pour les commandes en livraison</li>
        <li><strong>Données de commande</strong> : détail des articles, montants, statut de commande</li>
        <li><strong>Données de navigation</strong> : cookies techniques nécessaires au fonctionnement du site (voir politique cookies)</li>
      </ul>
      <p>
        <strong>Aucune donnée bancaire</strong> n&apos;est collectée ni stockée par SEMOUS. Le paiement en ligne est géré par un prestataire certifié PCI-DSS.
      </p>

      <h2>3. Finalités et bases légales du traitement</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gestion et exécution des commandes</td>
            <td>Exécution du contrat (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Communication relative à votre commande (confirmations, mises à jour de statut)</td>
            <td>Exécution du contrat (art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Gestion des réclamations et du support client</td>
            <td>Intérêt légitime (art. 6.1.f RGPD)</td>
          </tr>
          <tr>
            <td>Respect des obligations légales et comptables</td>
            <td>Obligation légale (art. 6.1.c RGPD)</td>
          </tr>
          <tr>
            <td>Envoi de communications marketing et promotions</td>
            <td>Consentement explicite (art. 6.1.a RGPD)</td>
          </tr>
          <tr>
            <td>Amélioration du service et statistiques anonymisées</td>
            <td>Intérêt légitime (art. 6.1.f RGPD)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Durée de conservation</h2>
      <ul>
        <li><strong>Données de compte client</strong> : 3 ans à compter du dernier achat ou de la dernière connexion</li>
        <li><strong>Données de commande</strong> : 3 ans (données clients) / 10 ans (obligations comptables)</li>
        <li><strong>Données de support</strong> : 1 an après clôture du ticket</li>
        <li><strong>Données de navigation / cookies</strong> : 13 mois maximum (voir politique cookies)</li>
        <li><strong>Consentements marketing</strong> : 3 ans à compter du recueil du consentement, ou jusqu&apos;au retrait</li>
      </ul>

      <h2>5. Destinataires des données</h2>
      <p>Vos données sont susceptibles d&apos;être transmises à :</p>
      <ul>
        <li><strong>Supabase Inc.</strong> (hébergeur base de données, serveurs UE) — contrat de traitement conforme RGPD</li>
        <li><strong>Netlify Inc.</strong> (hébergeur du site web, serveurs UE) — contrat de traitement conforme RGPD</li>
        <li><strong>Resend Inc.</strong> (envoi d&apos;e-mails transactionnels) — contrat de traitement conforme RGPD</li>
        <li>Les membres du personnel de SEMOUS habilités à traiter votre commande</li>
      </ul>
      <p>Aucune vente, location ou partage de vos données à des tiers à des fins commerciales n&apos;est effectué.</p>

      <h2>6. Transferts hors Union Européenne</h2>
      <p>
        Certains sous-traitants mentionnés ci-dessus sont établis aux États-Unis. Ces transferts sont encadrés par des Clauses Contractuelles Types (CCT) approuvées par la Commission européenne, garantissant un niveau de protection adéquat de vos données.
      </p>

      <h2>7. Vos droits</h2>
      <p>Conformément au Règlement Général sur la Protection des Données (RGPD — UE 2016/679) et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
      <ul>
        <li><strong>Droit d&apos;accès</strong> (art. 15) : obtenir une copie de vos données personnelles</li>
        <li><strong>Droit de rectification</strong> (art. 16) : corriger des données inexactes ou incomplètes</li>
        <li><strong>Droit à l&apos;effacement</strong> (art. 17) : demander la suppression de vos données</li>
        <li><strong>Droit à la limitation</strong> (art. 18) : limiter le traitement de vos données</li>
        <li><strong>Droit à la portabilité</strong> (art. 20) : recevoir vos données dans un format structuré</li>
        <li><strong>Droit d&apos;opposition</strong> (art. 21) : vous opposer au traitement basé sur l&apos;intérêt légitime ou à des fins de prospection</li>
        <li><strong>Droit de retrait du consentement</strong> : à tout moment, sans effet sur les traitements passés</li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous à <strong>contact@semous.fr</strong> ou via notre{' '}
        <a href="/contact">formulaire de contact</a>. Nous nous engageons à répondre dans un délai d&apos;un mois.
      </p>
      <p>
        En cas de réponse insatisfaisante, vous pouvez introduire une réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
      </p>

      <h2>8. Sécurité</h2>
      <p>
        SEMOUS met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou altération : chiffrement des communications (HTTPS/TLS), Row Level Security sur la base de données, accès administrateur restreint et authentifié, sauvegardes régulières.
      </p>

      <h2>9. Cookies</h2>
      <p>Pour toute information relative aux cookies utilisés sur ce site, consultez notre <a href="/legal/cookies">politique cookies</a>.</p>

      <h2>10. Modifications</h2>
      <p>
        Cette politique peut être mise à jour pour refléter les évolutions légales ou les changements dans nos pratiques. En cas de modification substantielle, vous serez informé par e-mail ou via une notification sur le site. La date de dernière mise à jour figure en haut de ce document.
      </p>
    </div>
  )
}
