# API for "Made in abyss" store

### Populate table via AWS CLI

#### Products table:

From src/db folder

```
aws dynamodb batch-write-item --request-items file://products-put-items.json
```

#### Stocks table:

```
aws dynamodb batch-write-item --request-items file://stocks-put-items.json
```
