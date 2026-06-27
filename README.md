# QUBCloud-FraudGuard — Country-Tally Service (Node.js / Express)

This is one of the two backend services in the QUBCloud-FraudGuard app. Its one
job is simple: **count how many transactions came from each country.**

It is **stateless** — it saves nothing to a database or disk. Give it the same
input and it always returns the same answer.

> The app is made of three separate repositories. The web page calls **both
> backend services directly** — there is no "middle man" in between:
>
> ```
>                       ┌──▶ screening-service  (decides OK / SUSPICIOUS)
>   frontend (web page) ┤
>                       └──▶ country-tally-service  (THIS repo — counts by country)
> ```
>
> This service runs and tests **completely on its own** — it does not depend on
> the other two.

---

## What it does

You send it transactions written as `amount-card-country` (e.g. `5000-1234-UK`),
separated by commas. It looks only at the **country** (the last part) and counts
how many transactions came from each one.

If a transaction is written wrongly (missing parts, or no country), it is
counted under **`UNKNOWN`** instead of crashing the service.

---

## The endpoints (web addresses it answers)

### `GET /tally?items=<comma-separated transactions>`

The root path `/` is an alias for `/tally`, so `GET /?items=...` returns the
same result.

```
GET /tally?items=5000-1234-UK,50000-9999-UK,200-4321-US,800-0000-CN
```

Returns JSON — a count for each country, plus the total number of transactions:

```json
{
  "counts": { "UK": 2, "US": 1, "CN": 1 },
  "total_checked": 4
}
```

### `GET /health`

Returns `{"status": "ok"}` — a simple "am I alive?" check.

---

## Settings (environment variables)

Read when the service starts, so nothing is hard-coded:

| Setting | Default | What it does                       |
|---------|---------|------------------------------------|
| `PORT`  | `8071`  | The port the service listens on.   |

(Port `8071` is used so it does not clash with the screening service on `8070`.)

---

## How to build and run it (Docker)

From inside this repository:

```bash
# 1. Build the image
docker build -t country-tally-service .

# 2. Run it (on port 8071)
docker run -d --name country-tally-service -p 8071:8071 country-tally-service

# 3. Try it
curl "http://localhost:8071/health"
curl "http://localhost:8071/tally?items=5000-1234-UK,50000-9999-UK,200-4321-US,800-0000-CN"
```

Stop and remove it when done:

```bash
docker rm -f country-tally-service
```

---

## The code (what each file is)

| File              | What it does                                            |
|-------------------|---------------------------------------------------------|
| `tally.js`        | The counting logic — the important part.                |
| `app.js`          | Wraps the logic in a small web service (the endpoints). |
| `test_tally.js`   | Automated tests for the counting logic.                 |
| `package.json`    | Declares the one dependency (Express) and the scripts.  |
| `Dockerfile`      | How to build the container image.                       |

Every file has plain-English comments — open them and read along.

---

## Running the tests

```bash
# Inside the Node image, without installing anything on your computer:
docker run --rm -v "$PWD":/app -w /app node:20-alpine \
  sh -c "npm install --silent && npm test"
```

(If you have Node installed locally, `npm install && npm test` also works.)

The tests cover: a normal batch, empty input, a malformed transaction (the
`UNKNOWN` bucket), and that the per-country counts add up to the total.
