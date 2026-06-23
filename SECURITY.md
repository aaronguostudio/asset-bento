# Security

Do not commit API keys, `.env` files, proprietary brand references, generated private assets, or private guided session records.

If you find a vulnerability, please open a GitHub security advisory or contact the repository owner privately. Avoid posting secrets, exploit details, or customer data in public issues.

Asset Bento loads `OPENAI_API_KEY` from the environment or local `.env`. The key is used only by the OpenAI image provider and must never be logged.
