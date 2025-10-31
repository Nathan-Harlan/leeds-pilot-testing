# Copilot Instructions

## Overview
This project uses Docker Compose to coordinate:
- **system-control** — main logic layer (runs from `/python-app`)
- **io-simulator** — publishes simulated motion and state data to MQTT
- **minimal-digital-twin** — renders motion and state in a Three.js web viewer
- **mqtt** — Eclipse Mosquitto broker for inter-container communication

The **system-control** container is the primary development target.  
A VS Code Dev Container setup is used to attach to this container for interactive development.  
The workspace is mounted to the **top-level repository**, providing access to Git and all project files.

## Conventions
- All interprocess communication uses **MQTT**.  
- Each message payload is **JSON**.  
- Environment variables (e.g., `MQTT_BROKER`) define network endpoints.  
- Use clear, descriptive topic names (e.g., `system/state`, `motion/update`).

## Code Style
- Use **Google-style docstrings** for all functions and classes.
- **Avoid `try`/`except` blocks** unless explicitly needed for functionality or robustness.
  Allow unexpected errors to raise during development.
- Follow **PEP 8** formatting and use type hints where appropriate.