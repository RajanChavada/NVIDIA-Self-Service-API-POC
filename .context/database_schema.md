# Database Schema (PostgreSQL)

## Goal: 
- Create a database schema for the self-service portal.
- The database schema will be used to store the requests for the self-service portal.


## Table: `provision_requests`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| user_id | VARCHAR(50) | Not Null |
| gpu_count | INT | Not Null |
| duration_hours | INT | Not Null |
| status | VARCHAR(20) | Enum(pending, provisioning, completed, failed) |
| kubeconfig | TEXT | Nullable |
| error_msg | TEXT | Nullable |
| created_at | TIMESTAMP | Default NOW() |
| updated_at | TIMESTAMP | Default NOW() |

# Mock table and data stored locally 
- The database will be used to store the requests for the self-service portal.
- We will use a mock database for the POC.