# QUBCloud-FraudGuard — Country-Tally Service (Node.js / Express)

A small Node.js service that counts how many transactions came from each country. It makes no judgement, it only counts.

Part of [QUBCloud-FraudGuard](https://github.com/QUBFraudGuard). Provided as part of the baseline app.

## API

```
GET /tally?items=5000-1234-UK,200-4321-US,800-0000-CN,100-1111-UK
```

```json
{
  "counts": { "UK": 2, "US": 1, "CN": 1 },
  "total_checked": 4
}
```

`GET /health` returns the service status.

## Design

Stateless: it stores nothing between requests. Requests reach it through [fgproxy](https://github.com/QUBFraudGuard/fgproxy40270840), which routes to it by name from its config file.

## Run it

```bash
git clone https://github.com/QUBFraudGuard/fgcountrytally40270840.git
cd fgcountrytally40270840
docker build -t fgcountrytally40270840 .
docker run -p 8071:8071 fgcountrytally40270840
```
