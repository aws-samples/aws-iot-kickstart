# Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: Apache-2.0

from ggiot import GGIoT
import json
import os
import socket
import sys
from threading import Event, Thread, Timer
import time
import datetime
import math

#############################################
## CONSTANT and variables declaration
#############################################
#Change it with your configuration

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default


THING_NAME = get_parameter("THING_NAME", get_parameter("AWS_IOT_THING_NAME", "UNKNOWN"))
PREFIX = "sputnik"

#############################################
## INIT
#############################################

# Greengrass
GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)


#############################################
## MAIN CODE
#############################################

def lambda_handler(event, context):
    try:
        topic = context.client_context.custom["subject"]
        payload = event
        print('Received message on topic %s: %s\n' % (topic, json.dumps(payload)))

        payload['sputnikGatewayMessage'] = "Hello from gateway!"

        GGIOT.publish(PREFIX + "/" + THING_NAME + "/" + topic, payload)

    except Exception as e:
        print(e)

    return
