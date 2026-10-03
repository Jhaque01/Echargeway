1.  **Analyze `src/lib/powerloop.ts`**: The file is quite long (~230 lines) and contains different domains of functionality.
2.  **Domains to split**:
    *   **Constants**: colors (`BG`, `S1`, etc.), constants (`UPI_ID`, `KWH_SES`, etc.), and styles (`CARD`, `IBOX`, etc.). This should go to `src/lib/powerloop/constants.ts`.
    *   **Stations data**: The `Station` interface, `STATIONS` array, and `BLR` coordinate. This should go to `src/lib/powerloop/stations.ts`.
    *   **Utils**: Distance formatting, calculation (`haversine`, `fmtDist`, `fmtTime`, `fmtAge`, `sortedStations`, `sessPrice`), QR/Deep Link generators (`makeQrUrl`, `makeDeepLink`), and `requestGeo`. This should go to `src/lib/powerloop/utils.ts`.
    *   **DB/API/Auth**: Local storage wrapper (`store`), local DB (`DB`), token utilities (`chkToken`), and mock API (`callApi`). This should go to `src/lib/powerloop/api.ts`.
3.  **Create a barrel file `src/lib/powerloop/index.ts`** that re-exports all these submodules to avoid breaking any existing imports across the application.
4.  **Remove `src/lib/powerloop.ts`** or replace its content entirely with an `export * from './powerloop/index'` or replace `src/lib/powerloop.ts` with the new file or change imports. Wait, since imports use `from '@/lib/powerloop'`, if we change `src/lib/powerloop.ts` to be the re-exporter, it keeps all imports intact and requires zero changes to the rest of the application.
    *   So, we create the files in `src/lib/powerloop/`, then rewrite `src/lib/powerloop.ts` to:
        ```ts
        export * from './powerloop/constants';
        export * from './powerloop/stations';
        export * from './powerloop/utils';
        export * from './powerloop/api';
        ```
5.  **Test changes**: Verify with `npm run build`, `npm run lint`, and `npm run test`.
