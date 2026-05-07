import { useEffect } from 'react'

export function useSeo({ title, description, keywords, ogImage } = {}) {
  useEffect(() => {
    const base = 'SEMOUS | Bols à la semoule · Toulouse'

    if (title) {
      document.title = `${title} · ${base}`
    } else {
      document.title = base
    }

    setMeta('description', description || 'SEMOUS — Restaurant halal spécialisé dans les bols à la semoule à Toulouse. Commande en ligne, livraison à domicile.')
    setMeta('keywords', keywords || 'semoule, couscous, bowl, halal, toulouse, livraison, commande en ligne')

    setMetaProperty('og:title', document.title)
    setMetaProperty('og:description', description || '')
    setMetaProperty('og:image', ogImage || '/og-image.jpg')
    setMetaProperty('og:type', 'website')

    setMetaName('twitter:card', 'summary_large_image')
    setMetaName('twitter:title', document.title)
    setMetaName('twitter:description', description || '')
  }, [title, description, keywords, ogImage])
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaProperty(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaName(name, content) {
  setMeta(name, content)
}
