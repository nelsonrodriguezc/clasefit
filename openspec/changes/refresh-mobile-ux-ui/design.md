# Design

## Context

See [proposal.md](./proposal.md) for motivation. The current app already follows Clean Architecture: domain and application logic are isolated from presentation, and the visible work for this change sits almost entirely in `src/presentation`, `src/navigation`, and theme tokens. The functional rules for booking, cancellation, and persistence already exist and should remain unchanged.

## Goals / Non-Goals

**Goals:**
- Unify the authenticated mobile experience with the provided visual reference.
- Add the splash, detail, and profile surfaces needed by the new shell.
- Keep booking/cancellation behavior and security guarantees intact.
- Preserve testability by keeping business rules outside presentation code.

**Non-Goals:**
- Changing RN-01 a RN-04, booking persistence, or encryption.
- Adding backend APIs, analytics, push notifications, or payments.
- Reworking domain rules or application use cases beyond what the UI needs to display.

## Decisions

### 1. Keep domain and application layers unchanged
The visual refresh should not move booking rules into presentation code or introduce new business logic. `src/domain` and `src/application` remain the source of truth; the new shell only adapts what those layers already expose.

**Alternatives considered:** duplicating rule checks in the UI. Rejected because it would violate SRP, increase drift risk, and make the UI a second rules engine.

### 2. Build the new shell as presentation-only composition
The redesign will be implemented as a set of reusable presentational components and screens in `src/presentation`, wired through the existing composition root. This keeps the UI cohesive while respecting the current layering and makes screenshot-level changes easy to test.

**Alternatives considered:** introducing a separate UI framework or a global app state layer. Rejected because the app already has the right boundaries and the change does not require a new architecture.

### 3. Use the existing React Navigation stack plus a nested detail flow
Bottom tabs stay as the top-level navigation pattern, but the "Próximas clases" flow gets a nested detail screen so the app can open a class card into the richer detail surface shown in the reference.

**Alternatives considered:** a drawer menu or a single long scroll screen. Rejected because the reference is tab-centric and the detail surface is a focused mobile interaction, not a navigation replacement.

### 4. Centralize the visual system in theme tokens and small primitives
Dark background, green accent colors, card elevation, radius, spacing, and status styles should live in `theme.ts` and shared primitives such as cards, banners, and buttons. Screens should compose those primitives rather than hard-code styles.

**Alternatives considered:** screen-local styles only. Rejected because the reference demands consistent treatment across multiple screens and future screens would otherwise drift.

### 5. Keep the splash lightweight and local
The splash screen should be a simple presentation layer using the brand mark and local assets already available to the app, with no new dependency and no network requirement.

**Alternatives considered:** a custom native splash pipeline or animated asset library. Rejected because the visual goal can be met with the existing Expo stack and the change does not justify extra surface area.

### 6. Preserve security posture and data minimization
The new surfaces must not expose personal data in logs, and they must not change how bookings are stored or encrypted. Any profile summary shown in the UI should come from already-available local state and remain within the existing privacy boundary.

**Alternatives considered:** adding richer account data from a server. Rejected because the product is still local-first and the current scope does not include backend work.

## Risks / Trade-offs

- [Risk] The new shell adds presentation components and navigation paths, which increases UI surface area. → Mitigation: keep logic in hooks/view-models and cover each new surface with acceptance tests and snapshot-like presentation tests.
- [Risk] Dark-theme styling can reduce contrast or accessibility if not tuned carefully. → Mitigation: keep text/background pairs on shared tokens and verify touch targets and readable states in tests.
- [Risk] The new detail/profile surfaces could tempt business logic into presentation. → Mitigation: reuse existing use cases and treat those surfaces as adapters over existing data.
- [Risk] Visual drift between screens if styles are duplicated. → Mitigation: centralize colors, spacing, radii, and common banners/cards in shared theme and components.

## Migration Plan

1. Update the shared visual tokens and primitives first so the rest of the UI can reuse the same palette, spacing, and card patterns.
2. Rework the navigation shell to add the profile surface and the nested detail route for class cards.
3. Refactor `Próximas clases` and `Mis reservas` to compose the new presentation primitives.
4. Add the splash surface and ensure the authenticated shell appears cleanly after startup.
5. Add or update presentation and acceptance tests for the new surfaces and transitions.
6. Run `npm run typecheck`, `npm run lint`, `npm test`, and finally `npm run verify` before considering the change complete.

**Rollback strategy:** if a visual step destabilizes navigation or tests, revert the last presentation-only layer first (theme tokens, then screens, then navigation) without touching domain or persistence code.

## Open Questions

None. The remaining work is implementation detail inside the chosen shell and does not require changing the spec or task breakdown.
