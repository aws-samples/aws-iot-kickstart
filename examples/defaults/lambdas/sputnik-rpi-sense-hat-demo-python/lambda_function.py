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

from sense_hat import SenseHat  # pylint: disable=import-error

#############################################
## CONSTANT and variables declaration
#############################################
#Change it with your configuration

def get_parameter(name, default):
    if name in os.environ and os.environ[name] != "":
        return os.environ[name]
    return default

THING_NAME = get_parameter("AWS_IOT_THING_NAME", "UNKNOWN")
PREFIX = "sputnik"

JOYSTICK_IS_TRIGGER = True
SEND_TELEMETRY = True
FREQUENCY = 1.0

TOPIC_TELEMETRY = "{}/{}/telemetry".format(PREFIX, THING_NAME)
TOPIC_JOYSTICK = "{}/{}/joystick".format(PREFIX, THING_NAME)
TOPIC_SCREEN = "{}/{}/screen".format(PREFIX, THING_NAME)
TOPIC_SHADOW_UPDATE_DELTA = "$aws/things/{}/shadow/update/delta".format(THING_NAME)
TOPIC_SHADOW_UPDATE_ACCEPTED = "$aws/things/{}/shadow/update/accepted".format(THING_NAME)

#############################################
## INIT
#############################################

# Greengrass
GGIOT = GGIoT(thing=THING_NAME, prefix=PREFIX)

# Initialize sense hat
sense = SenseHat()
sense.set_imu_config(True, True, True)
sense.set_rotation(180)
sense.low_light = True
sense.clear(255, 255, 0)
GGIOT.updateThingShadow(payload={"state": {"reported": {"screen": {"r": 255, "g": 255, "b": 0}}}})
print("Sense Hat and IMU initialized")


#############################################
## SENSE HAT INPUTS
#############################################
#Callback for joystick event
def joystick_callback(event):
    global JOYSTICK_IS_TRIGGER
    if event.action == "pressed":
        print("Joystick was pressed: %s" % (json.dumps(event)))
        GGIOT.publish(topic=TOPIC_JOYSTICK, payload=event)
        if JOYSTICK_IS_TRIGGER:
            GGIOT.publish(TOPIC_TELEMETRY, getSenseHatReadings())

#Assigning callback
sense.stick.direction_any = joystick_callback

# Get readings from the sense hat
def getSenseHatReadings():
    senseHatReadings = {}

    # Readings from sensors
    senseHatReadings['id'] = THING_NAME
    senseHatReadings['humidity'] = math.floor(sense.humidity)
    senseHatReadings['temperature'] = math.floor(sense.temp)
    senseHatReadings['temperatureFromPressure'] = math.floor(sense.get_temperature_from_pressure())
    senseHatReadings['pressure'] = math.floor(sense.pressure)
    senseHatReadings['orientation'] = sense.orientation
    senseHatReadings['gyroscope'] = sense.gyroscope
    senseHatReadings['accelerometer'] = sense.accelerometer
    senseHatReadings['compass'] = sense.compass
    senseHatReadings['gyroscopeRAW'] = sense.gyroscope_raw
    senseHatReadings['accelerometerRAW'] = sense.accelerometer_raw
    x = sense.get_accelerometer_raw()['x']
    y = sense.get_accelerometer_raw()['y']
    z = sense.get_accelerometer_raw()['z']
    senseHatReadings['magnitude'] = math.sqrt(x*x + y*y + z*z)
    senseHatReadings['compassRAW'] = sense.compass_raw
    senseHatReadings['epoch'] = int(time.time())
    senseHatReadings['timestamplocal'] = str(datetime.datetime.now().isoformat()).split('.')[0]
    senseHatReadings['timestamputc'] = str(datetime.datetime.utcnow().isoformat()).split('.')[0]

    return senseHatReadings

#############################################
## MAIN CODE
#############################################

def printShadowObject():
    print("JOYSTICK_IS_TRIGGER: {}".format(JOYSTICK_IS_TRIGGER))
    print("SEND_TELEMETRY:      {}".format(SEND_TELEMETRY))
    print("FREQUENCY:           {}".format(FREQUENCY))

def parseIncomingShadow(shadow):

    global JOYSTICK_IS_TRIGGER
    global SEND_TELEMETRY
    global FREQUENCY

    if "state" in shadow:
        state = shadow["state"]
        if "desired" in state:
            desired = state["desired"]

            if "joystickIsTrigger" in desired or "sendTelemetry" in desired or "frequency" in desired:
                if "joystickIsTrigger" in desired:
                    JOYSTICK_IS_TRIGGER = desired['joystickIsTrigger']
                if "sendTelemetry" in desired:
                    SEND_TELEMETRY = desired['sendTelemetry']
                if "frequency" in desired:
                    FREQUENCY = desired['frequency']
                GGIOT.updateThingShadow(payload={"state": {"reported": {"joystickIsTrigger": JOYSTICK_IS_TRIGGER, "sendTelemetry": SEND_TELEMETRY, "frequency": FREQUENCY}}})
                printShadowObject()


def lambda_handler(event, context):
    try:
        topic = context.client_context.custom["subject"]
        payload = event
        print('Received message on topic %s: %s\n' % (topic, json.dumps(payload)))

        if topic == TOPIC_SHADOW_UPDATE_ACCEPTED:
            parseIncomingShadow(event)
        elif topic == TOPIC_SHADOW_UPDATE_DELTA:
            if "state" in event:
                state = event["state"]
                parseIncomingShadow({"state": {"desired": state}})
        elif topic == TOPIC_SCREEN and 'screen' in payload:
            if 'r' in payload['screen'] and 'g' in payload['screen'] and 'b' in payload['screen']:
                sense.clear(payload['screen']['r'], payload['screen']['g'], payload['screen']['b'])
                GGIOT.updateThingShadow(payload={"state": {"reported": {"screen": payload['screen']}}})
            elif isinstance(payload['screen'], basestring):
                sense.show_message(payload['screen'], scroll_speed=0.05)
                GGIOT.updateThingShadow(payload={"state": {"reported": {"screen": payload['screen']}}})

    except Exception as e:
        print(e)

    return


class MainAppThread(Thread):

    global FREQUENCY
    global SEND_TELEMETRY
    global JOYSTICK_IS_TRIGGER

    def __init__(self):
        super(MainAppThread, self).__init__()
        self.stop_request = Event()
        print("MainAppThread.init")

    def join(self):
        self.stop_request.set()

    def run(self):
        try:
            #Indicates it's connected and ready
            sense.clear(0, 255, 0)
            GGIOT.updateThingShadow(payload={"state": {"reported": {"screen": {"r": 0, "g": 255, "b": 0}}}})

            parseIncomingShadow(GGIOT.getThingShadow())

            while 42:
                senseHatReadings = getSenseHatReadings()

                if (str(SEND_TELEMETRY) == 'True'):
                    GGIOT.publish(TOPIC_TELEMETRY, senseHatReadings)
                    print('Published to topic %s: %s\n' % (TOPIC_TELEMETRY, json.dumps(senseHatReadings)))
                    printShadowObject()

                time.sleep(float(FREQUENCY))

        except Exception as err:
            print(err)
            time.sleep(5)



mainAppThread = MainAppThread()
mainAppThread.start()
