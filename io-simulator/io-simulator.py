"""Minimal io-simulator MQTT publisher.

Publishes a periodic status message to `io-simulator/status`.
"""
from __future__ import annotations

import json
import os
import time

import paho.mqtt.client as mqtt

BROKER_HOST = os.getenv("MQTT_BROKER", "localhost")
BROKER_PORT = 1883
TOPIC = "io-simulator/status"
MESSAGE = {"msg": "hello world"}

client = mqtt.Client()
client.connect(BROKER_HOST, BROKER_PORT, 60)

print(f"Connected to MQTT broker at {BROKER_HOST}:{BROKER_PORT}. Publishing retained message to {TOPIC} and exiting.")

payload = json.dumps(MESSAGE)
result = client.publish(TOPIC, payload, qos=2, retain=True)
print(f"Published retained payload={payload} rc={result[0]}")

