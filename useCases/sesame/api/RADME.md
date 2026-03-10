# API

This folder contains the backend services for the SESAME project.

## Active backend

The active backend is the Spring Boot application in [springBoot-simulator](/Users/francesco/workspace/git/PHD/DLTF-RUIT/useCases/sesame/api/springBoot-simulator).

Run it with:

```bash
cd api/springBoot-simulator
./mvnw spring-boot:run
```

The service starts on port `8099`.

## Main endpoints

- `POST /newsimulation`
- `GET /results/charts/**`
- `GET /results/csv/**`

## Notes

- The legacy Node wrapper and prebuilt jar are no longer part of the supported runtime flow.
- Backend validation and packaging are handled through Maven in `springBoot-simulator`.
