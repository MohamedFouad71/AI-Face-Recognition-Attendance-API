# Environment Variables

Copy `.env.example` to `.env` and adjust the values as needed:

| Variable               | Default / Example                            | Description                                                                                                                          |
| ---------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                 | `3000`                                       | Port the Express server listens on                                                                                                   |
| `MONGO_URI`            | _(none — you must set this)_                 | MongoDB **Atlas** connection string. Get it from the Atlas dashboard → _Connect_ → _Drivers_. Atlas is required for `$vectorSearch`. |
| `REDIS_URI`            | `redis://localhost:6379`                     | Redis connection string                                                                                                              |
| `AI_EXTRACT_FACE_URL`  | `http://localhost:5000/api/v1/extract-faces` | AI face extraction service endpoint                                                                                                  |
| `AI_HEALTH_CHECK`      | `http://localhost:5000/health`               | AI service health check endpoint (polled at startup with up to 10 retries, 5 s apart)                                                |
| `FRONTEND_URL`         | _(your frontend origin)_                     | Frontend URL used for CORS or redirects                                                                                              |
| `JWT_SECRET`           | _(none — you must set this)_                 | Secret key used to sign and verify JWT tokens                                                                                        |
| `JWT_EXPIRES_IN`       | `90d`                                        | JWT expiry duration (e.g. `1d`, `7d`, `90d`)                                                                                         |
| `ADMIN_CREATION_TOKEN` | _(none — you must set this)_                 | Secret token required in the request body to register a user with the `admin` role                                                   |
| `SMTP_HOST`            | _(your SMTP host)_                           | SMTP server host for sending password reset emails                                                                                   |
| `SMTP_PORT`            | `587`                                        | SMTP server port                                                                                                                     |
| `SMTP_USER`            | _(your SMTP username)_                       | SMTP authentication username                                                                                                         |
| `SMTP_PASS`            | _(your SMTP password)_                       | SMTP authentication password                                                                                                         |
