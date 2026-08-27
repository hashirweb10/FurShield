# FurShield Demo Credentials

All demo accounts use the password: **`password123`**

## Pet Owner Accounts

| # | Email | Name | Dashboard |
|---|---|---|---|
| 1 | owner@furshield.com | Aisha Rahman | `/dashboard/owner` |
| 2 | owner2@furshield.com | Bilal Hassan | `/dashboard/owner` |

**Owner features**: Manage pets, health records, appointments, products/cart/orders, adoption, care center, AI chat, notifications, reviews, profile.

## Veterinarian Accounts

| # | Email | Name | Dashboard |
|---|---|---|---|
| 1 | vet@furshield.com | Dr. Sarah Ahmed | `/dashboard/vet` |
| 2 | vet2@furshield.com | Dr. Hamza Khan | `/dashboard/vet` |

**Vet features**: Manage appointments (approve/reject/complete), view patients, add medical records, manage availability, view reviews, edit profile.

## Animal Shelter Accounts

| # | Email | Name | Dashboard |
|---|---|---|---|
| 1 | shelter@furshield.com | Paws Haven | `/dashboard/shelter` |
| 2 | shelter2@furshield.com | Happy Tails Shelter | `/dashboard/shelter` |

**Shelter features**: Manage adoption listings, review applications, track care logs (feeding/grooming/medical), edit profile.

## Login Instructions

1. Go to `http://localhost:5173/login`
2. Enter the email and password `password123`
3. You will be redirected to your role's dashboard

## What's Pre-seeded

The database includes:
- 4 pets across 2 owner accounts
- 7 health records and 7 vaccinations
- 12 vet availability slots
- 5 appointments (various statuses)
- 8 products in 5 categories
- 6 adoption listings with 3 applications
- 5 care articles and 5 FAQs
- 5 notifications and 5 reviews

## Registering New Accounts

You can also register new accounts at `http://localhost:5173/register`:
1. Choose a role (Pet Owner, Veterinarian, or Animal Shelter)
2. Fill in the registration form
3. You'll be automatically logged in and redirected to your dashboard
