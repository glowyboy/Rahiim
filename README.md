# GestionPro DZ - Système de Gestion Commercial

Application de gestion commerciale complète pour l'Algérie avec support multilingue (Français, Arabe, Anglais).

## 🚀 Démarrage Rapide

### 1. Installation
```bash
npm install
```

### 2. Configuration de la Base de Données

**IMPORTANT:** Avant d'utiliser l'application, vous devez configurer la base de données Supabase.

1. Allez sur https://toqxppdffjrnrrqntxyb.supabase.co
2. Cliquez sur "SQL Editor"
3. Copiez et exécutez le contenu de `supabase/migrations/00000000000000_initial_schema.sql`
4. Désactivez RLS (Row Level Security) pour toutes les tables:

```sql
ALTER TABLE app_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE client_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE treasury_transactions DISABLE ROW LEVEL SECURITY;
```

### 3. Lancer l'Application
```bash
npm run dev
```

Ouvrez http://localhost:5173

### 4. Connexion
- **Nom d'utilisateur:** admin
- **Mot de passe:** admin123

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Vue d'ensemble des ventes, achats, et trésorerie
- Statistiques en temps réel
- Graphiques et indicateurs clés

### 📦 Gestion des Articles
- Ajouter, modifier, supprimer des produits
- Gestion des catégories
- Suivi du stock en temps réel
- Prix d'achat et de vente
- Association avec fournisseurs

### 👥 Gestion des Clients
- Fiche client complète
- Historique des achats
- Suivi des dettes
- Gestion des versements

### 🚚 Gestion des Fournisseurs
- Informations complètes (RC, NIF, NIS)
- Historique des commandes
- Suivi des paiements
- Gestion des dettes fournisseurs

### 💰 Point de Vente (POS)
- Interface de caisse intuitive
- Ajout rapide de produits
- Calcul automatique
- Gestion des paiements partiels
- Impression de factures
- **Mise à jour automatique du stock**
- **Enregistrement dans la trésorerie**

### 🛒 Historique des Achats
- Vue complète de tous les achats
- Détails par client
- Liste des produits achetés
- Filtrage par statut de paiement
- Recherche par client ou produit

### 📥 Arrivage Fournisseur
- Enregistrement des commandes
- **Augmentation automatique du stock**
- Gestion des paiements
- Suivi des dettes fournisseurs
- **Mise à jour de la trésorerie**

### 💵 Trésorerie
- Suivi de toutes les transactions
- Entrées et sorties
- Solde en temps réel
- Historique complet
- Ajouts/retraits manuels

### 👤 Gestion des Utilisateurs
- Rôles: Admin, Manager, Vendeur
- Permissions par rôle
- Activation/désactivation

### ⚙️ Système
- **Sélection de langue** (Français, العربية, English)
- Export des données (JSON)
- Sauvegarde complète
- Informations système
- Déconnexion sécurisée

## 🌍 Support Multilingue

L'application supporte 3 langues:
- 🇫🇷 Français
- 🇩🇿 العربية (Arabe - maintient la disposition LTR)
- 🇬🇧 English

La langue est sauvegardée localement et persiste entre les sessions.

## 🔄 Mises à Jour en Temps Réel

L'application met à jour automatiquement:
- ✅ Stock des produits (diminue lors des ventes, augmente lors des arrivages)
- ✅ Dettes clients (augmente avec les ventes impayées, diminue avec les versements)
- ✅ Dettes fournisseurs (augmente avec les commandes impayées, diminue avec les paiements)
- ✅ Trésorerie (enregistre toutes les entrées et sorties)
- ✅ Historique des achats (affiche tous les achats avec détails)
- ✅ Statistiques du tableau de bord

## 🐛 Dépannage

Si les données ne se mettent pas à jour:

1. **Vérifiez la console du navigateur (F12)**
   - Recherchez les messages d'erreur en rouge
   - Vérifiez les logs de débogage

2. **Vérifiez que la base de données est configurée**
   - Voir `DATABASE_SETUP.md`
   - Assurez-vous que toutes les tables existent

3. **Désactivez RLS dans Supabase**
   - Voir la section Configuration ci-dessus

4. **Consultez le guide de dépannage**
   - Voir `TROUBLESHOOTING.md` pour plus de détails

## 📁 Structure du Projet

```
project/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── contexts/        # Context API (AppContext)
│   ├── lib/            # Utilitaires et configuration
│   │   ├── supabase.ts # Configuration Supabase
│   │   ├── translations.ts # Système de traduction
│   │   └── types.ts    # Types TypeScript
│   └── pages/          # Pages de l'application
│       ├── Dashboard.tsx
│       ├── Articles.tsx
│       ├── Clients.tsx
│       ├── Fournisseurs.tsx
│       ├── GestionClient.tsx
│       ├── GestionFournisseur.tsx
│       ├── Purchases.tsx  # Historique des achats
│       ├── Tresorerie.tsx
│       ├── Utilisateurs.tsx
│       └── Systeme.tsx
├── supabase/
│   └── migrations/     # Migrations de base de données
├── .env               # Variables d'environnement
└── package.json

```

## 🔐 Sécurité

- Authentification par nom d'utilisateur/mot de passe
- Gestion des rôles et permissions
- Connexion sécurisée à Supabase
- Validation des données côté client et serveur

## 📝 Notes Importantes

1. **Stock:** Le stock est automatiquement mis à jour lors des ventes (diminue) et des arrivages (augmente)
2. **Trésorerie:** Toutes les transactions financières sont enregistrées automatiquement
3. **Dettes:** Les dettes clients et fournisseurs sont calculées automatiquement
4. **Historique:** Tous les achats sont enregistrés avec les détails complets

## 🛠️ Technologies

- **Frontend:** React 19 + TypeScript
- **UI:** Shadcn/ui + Tailwind CSS
- **Base de données:** Supabase (PostgreSQL)
- **Build:** Vite
- **Icons:** Lucide React

## 📞 Support

Pour toute question ou problème:
1. Consultez `TROUBLESHOOTING.md`
2. Vérifiez la console du navigateur
3. Consultez les logs Supabase

## 📄 Licence

Propriétaire - GestionPro DZ © 2026
