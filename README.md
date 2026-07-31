# Diffusion Node Database Schema

The initial data model was expanded from a simple four-model design to a robust thirteen-model relational schema to better track the complexities of export controls across companies, countries, technologies, and historical timelines.

## Core Models

### Entities & Hierarchy
- **Technology & TechnologyCategory**: Organizes restricted items. V1 focuses on Semiconductors and AI.
- **Company & Country**: Companies are linked to their HQ countries and their status on various Entity Lists.
- **RestrictionType & Jurisdiction**: Captures *which* country is restricted under *what* rule for a specific policy.

### Policy & History
- **Policy**: The core regulation record.
- **PolicySource & Document**: Links the policy to its official origin (BIS, OFAC) and actual published PDFs or links.
- **PolicyRevision & TimelineEvent**: Stores the historical trajectory of a policy (e.g., Initial Publication -> Expansion -> Rescission), not just the current active state.
