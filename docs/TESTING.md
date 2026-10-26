# Quality and Testing Report

**Application:** D&G E-Commerce Mobile App  
**Report status:** Implementation-level review and static checks; no physical-device lab or live backend was supplied.

## Functional testing

| Scenario | Coverage in app | Verification status |
| --- | --- | --- |
| Browse collection; search by name/category; filter by category and price | Home and Categories screens; shared product filters | Implemented; manual runtime test pending |
| Pull-to-refresh and API failure feedback | Product API thunk and refresh control | Implemented; live API test pending |
| View a product and add to bag | Product detail route and Redux cart | Implemented; manual runtime test pending |
| Change quantity, remove products, compute totals | Cart slice, stock limit, subtotal and delivery display | Implemented; manual runtime test pending |
| Register, sign in, restore session, and sign out | Formik/Yup forms and persisted JWT | Implemented; requires backend test account |
| Validate Rwanda shipping phone and required address | Checkout schema | Implemented; form test pending |
| Place order, show confirmation, display history and status | Order service/slice and timeline | Implemented; requires backend |
| Switch English/Kinyarwanda and persist preference | i18next and AsyncStorage | Implemented; manual runtime test pending |

## Security testing

| Control / check | Result |
| --- | --- |
| JWT transport | Axios adds `Authorization: Bearer` from the stored session |
| Unauthorized response | HTTP 401 clears the persisted session and dispatches logout |
| Sensitive server-side operations | Checkout and account/order routes are gated; server authorization is still mandatory |
| Client-side input checks | Yup validates email, password strength, shipping fields, and Rwanda phone format |
| Price and payment trust boundary | Documentation and API contract require server-side price/inventory calculation and payment processing |
| Secret exposure | API URL is public client configuration; `.env.example` contains no credentials |
| Storage at rest | AsyncStorage is not encrypted; this is a known limitation, with SecureStore migration recommended |
| Dependency audit | npm install reported 5 high-severity dependency advisories; investigate with `npm audit` before release |

This is not a penetration test. No claim is made that the backend, payment provider, or production configuration has been security-tested.

## Usability testing

- Touch-oriented controls, scrollable layouts, visible empty/error states, loading indicators, and a product refresh gesture are implemented.
- Form fields have labels, keyboard types, validation messages, and secure password entry.
- Checkout supports Rwanda address fields and mobile money, card, and cash-on-delivery selection.
- English and Kinyarwanda translations cover shared navigation, cart, and profile labels. Several product and form descriptions remain English.
- Accessibility labels/roles are set on primary product and button controls. Screen-reader and dynamic-font testing remains pending.

## Compatibility testing

| Target | Status |
| --- | --- |
| iOS | Expo-compatible source; simulator/device validation pending |
| Android | Expo-compatible source; emulator/device validation pending |
| Web | Expo Router web target; browser validation pending |
| Small-screen layout | Responsive flex/scroll layouts; physical viewport checks pending |

No generated native folders are edited directly; Expo Continuous Native Generation remains the source of native projects.

## Performance testing

- Product collections use `FlatList` with stable keys and two-column rows.
- Search filtering is memoized; images use React Native `Image`.
- Axios requests have a 15-second timeout.
- No benchmark, profiler run, low-memory test, or production bundle-size measurement has been performed. These should be run against representative devices and a staging API before release.

## Static validation

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | Passed |
| `npx expo lint` | Passed with 0 errors and 2 `import/no-named-as-default-member` advisory warnings (`axios.create` and `i18n.use`) |
| `npx expo export --platform web` | Passed |
| `npx expo export --platform android` | Passed |
| `npx expo export --platform ios` | Passed |
| `npm audit --omit=dev` | Reports 5 high-severity advisories in the Expo CLI dependency chain (`node-forge` and `zod`); the suggested forced fix downgrades Expo to 44 and was not applied |

The successful bundle exports validate compilation, not device behavior or an API integration. Runtime/API tests still require a configured staging backend and test account.
