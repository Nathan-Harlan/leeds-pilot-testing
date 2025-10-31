"""System Control service minimal loop.

On start: publishes retained hello world to `system-control/status` (QoS 2).
Loop: publishes current epoch seconds to `system-control/scan_time` every 5 seconds.
"""
from __future__ import annotations

import json
import os
import time

import paho.mqtt.client as mqtt

BROKER_HOST = os.getenv("MQTT_BROKER", "localhost")
BROKER_PORT = 1883
STATUS_TOPIC = "system-control/status"
SCAN_TOPIC = "system-control/scan_time"
STATUS_MESSAGE = {"msg": "hello world"}
LOOP_INTERVAL_SEC = 5

client = mqtt.Client()
client.connect(BROKER_HOST, BROKER_PORT, 60)

print(f"Connected to MQTT broker at {BROKER_HOST}:{BROKER_PORT}. Publishing retained status then entering scan loop.")

status_payload = json.dumps(STATUS_MESSAGE)
status_result = client.publish(STATUS_TOPIC, status_payload, qos=2, retain=True)
print(f"Published retained status payload={status_payload} rc={status_result[0]}")

while True:
	scan_time = time.time()
	scan_payload = json.dumps({"scan_time": scan_time})
	r = client.publish(SCAN_TOPIC, scan_payload, qos=0, retain=False)
	print(f"Published scan_time payload={scan_payload} rc={r[0]}")
	time.sleep(LOOP_INTERVAL_SEC)

