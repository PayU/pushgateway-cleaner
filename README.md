# Pushgateway Cleaner

This project purpose is to clean old metrics from Prometheus pushgateway.  
It works as job and not a service, which means that after cleanup the process will die.

## Environment variables
| Variable | Description | Examples |
| -----------------------------      | - | - |
| PUSHGATEWAY_URL                    | the PushGateway endpoint (url + port) | http://100.10.102.23:9091 |
| TTL_HOURS                          | metrics created during this time will not be removed | 24 |


## Starting local
```npm install```  
```PUSHGATEWAY_URL=http://localhost:9091 TTL_HOURS=24 npm run start```

## Running tests
| Type | Command |  
| - | - |  
| Integration Tests | PUSHGATEWAY_URL=http://localhost:9091 TTL_HOURS=24 npm run test      | 
